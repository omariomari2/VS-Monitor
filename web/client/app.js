const API_BASE = document.body.dataset.apiBase || "http://localhost:4000";

const elements = {
  locationSelect: document.getElementById("locationSelect"),
  startDate: document.getElementById("startDate"),
  endDate: document.getElementById("endDate"),
  startButton: document.getElementById("startButton"),
  stopButton: document.getElementById("stopButton"),
  refreshButton: document.getElementById("refreshButton"),
  clearButton: document.getElementById("clearButton"),
  statusPill: document.getElementById("statusPill"),
  statusText: document.getElementById("statusText"),
  statusNotice: document.getElementById("statusNotice"),
  tzInfo: document.getElementById("tzInfo"),
  locationError: document.getElementById("locationError"),
  startDateError: document.getElementById("startDateError"),
  endDateError: document.getElementById("endDateError"),
  slotTableBody: document.getElementById("slotTableBody"),
  slotsSummary: document.getElementById("slotsSummary"),
  earliestSlot: document.getElementById("earliestSlot"),
  earliestMeta: document.getElementById("earliestMeta"),
  lastChecked: document.getElementById("lastChecked"),
  slotCount: document.getElementById("slotCount"),
  monitorForm: document.getElementById("monitorForm"),
};

const state = {
  locations: [],
  isRunning: false,
  pollTimer: null,
  lastEarliestKey: null,
  lastSlotCount: 0,
  prefs: null,
  manualRefreshTimer: null,
  manualRefreshToken: 0,
  syncingFromExtension: false,
  extStatusReceived: false,
  bookingWindow: null,
  pendingBookingUrl: "",
};

const getLocalISODate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const parseLocalDate = (value) => {
  if (!value) {
    return null;
  }
  const parts = value.split("-");
  if (parts.length !== 3) {
    return null;
  }
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  return new Date(year, month, day);
};

const showError = (elem, message) => {
  elem.textContent = message;
  elem.style.display = "block";
};

const hideError = (elem) => {
  elem.style.display = "none";
};

const captureSnapshot = () => ({
  earliestKey: state.lastEarliestKey || null,
  total: typeof state.lastSlotCount === "number" ? state.lastSlotCount : 0,
});

const sendExtensionMessage = (type, payload) => {
  window.postMessage(
    {
      source: "ged-web",
      type,
      payload,
    },
    "*"
  );
};

const setNotice = (message, variant = "") => {
  elements.statusNotice.textContent = message;
  elements.statusNotice.classList.remove("success", "alert");
  if (variant) {
    elements.statusNotice.classList.add(variant);
  }
};

const sendBookingToExtension = (payload) => {
  const bookingUrl =
    "https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=up";
  state.bookingWindow = window.open("about:blank", "_blank");
  if (!state.bookingWindow) {
    setNotice(
      "Popup blocked. Allow popups so we can open the booking page.",
      "alert"
    );
  }

  sendExtensionMessage("BOOK_APPT", payload);
  setNotice(
    "Selection sent. Waiting for the extension to confirm.",
    "success"
  );
  state.pendingBookingUrl = bookingUrl;
};

const setStatus = (running) => {
  state.isRunning = running;
  elements.statusPill.textContent = running ? "Monitoring" : "Stopped";
  elements.statusText.textContent = running
    ? "Checking every 60 seconds"
    : "Not monitoring";
  elements.statusPill.classList.toggle("running", running);
  elements.startButton.disabled = running;
  elements.stopButton.disabled = !running;
  elements.locationSelect.disabled = running;
  elements.startDate.disabled = running;
  elements.endDate.disabled = running;
};

const updateTimezoneInfo = () => {
  const selectedOption = elements.locationSelect.selectedOptions[0];
  const tzData = selectedOption?.dataset?.tz || "--";
  elements.tzInfo.textContent = tzData;
};

const validateDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startValue = elements.startDate.value;
  const endValue = elements.endDate.value;
  const startDate = parseLocalDate(startValue);
  const endDate = parseLocalDate(endValue);

  let isValid = true;

  if (!startValue) {
    showError(elements.startDateError, "Please enter a valid start date.");
    isValid = false;
  } else if (!startDate || startDate < today) {
    showError(elements.startDateError, "Start date must not be before today.");
    isValid = false;
  } else {
    hideError(elements.startDateError);
  }

  if (!endValue) {
    showError(elements.endDateError, "Please enter a valid end date.");
    isValid = false;
  } else if (!endDate || endDate <= startDate) {
    showError(elements.endDateError, "End date must be after the start date.");
    isValid = false;
  } else {
    hideError(elements.endDateError);
  }

  return isValid;
};

const validateForm = () => {
  let isValid = true;
  if (!elements.locationSelect.value) {
    showError(elements.locationError, "Please select a valid location.");
    isValid = false;
  } else {
    hideError(elements.locationError);
  }

  if (!validateDates()) {
    isValid = false;
  }

  return isValid;
};

const formatDateTime = (date, timeZone) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone,
    }).format(date);
  } catch (error) {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(date);
  }
};

const formatSlotDateTime = (date, timeZone) => {
  const dateOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "2-digit",
  };
  const timeOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  try {
    const datePart = new Intl.DateTimeFormat("en-US", {
      ...dateOptions,
      timeZone,
    }).format(date);
    const timePart = new Intl.DateTimeFormat("en-US", {
      ...timeOptions,
      timeZone,
    }).format(date);
    return `${datePart} || ${timePart}`;
  } catch (error) {
    const datePart = new Intl.DateTimeFormat("en-US", dateOptions).format(date);
    const timePart = new Intl.DateTimeFormat("en-US", timeOptions).format(date);
    return `${datePart} || ${timePart}`;
  }
};

const extractSlotDate = (slot) => {
  const raw = slot.timestamp || slot.startTimestamp || slot.startTime;
  if (!raw) {
    return { raw: "--", date: null };
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return { raw, date: null };
  }

  return { raw, date: parsed };
};

const renderEmptyRow = (message) => {
  const row = document.createElement("tr");
  row.className = "slot-row empty";
  const cell = document.createElement("td");
  cell.colSpan = 3;
  cell.className = "slot-empty";
  cell.textContent = message;
  row.appendChild(cell);
  elements.slotTableBody.appendChild(row);
};

const renderSlots = (slots = []) => {
  elements.slotTableBody.innerHTML = "";

  if (!slots.length) {
    renderEmptyRow("No open slots in this date range.");
    elements.earliestSlot.textContent = "No open slots";
    elements.earliestMeta.textContent = "Try widening the date range.";
    elements.slotCount.textContent = "0";
    elements.slotsSummary.textContent = "No open slots found.";
    return;
  }

  const tzData = state.prefs?.tzData || undefined;
  const locationName = state.prefs?.locationName || "Selected location";
  const locationId = state.prefs?.locationId || "";

  slots.forEach((slot, index) => {
    const { raw, date } = extractSlotDate(slot);
    const row = document.createElement("tr");
    row.className = "slot-row";
    if (index === 0) {
      row.classList.add("highlight");
    }

    const timeCell = document.createElement("td");
    timeCell.textContent = date ? formatSlotDateTime(date, tzData) : raw;

    const localCell = document.createElement("td");
    localCell.className = "slot-meta";
    localCell.textContent = date
      ? formatSlotDateTime(date)
      : "Time displayed as provided";

    const actionCell = document.createElement("td");
    actionCell.className = "slot-count";
    const actionButton = document.createElement("button");
    actionButton.type = "button";
    actionButton.className = "slot-link";
    actionButton.textContent = "Book appointment";
    if (typeof slot.active === "number") {
      actionButton.textContent = `Book appointment (${slot.active})`;
    }
    actionButton.addEventListener("click", () => {
      sendBookingToExtension({
        locationId,
        locationName,
        slotTimestamp: raw,
        slotDisplay: date ? formatSlotDateTime(date, tzData) : raw,
        tzData: tzData || "",
      });
    });
    actionCell.appendChild(actionButton);

    row.append(timeCell, localCell, actionCell);
    elements.slotTableBody.appendChild(row);
  });

  const earliest = extractSlotDate(slots[0]);
  elements.earliestSlot.textContent = earliest.date
    ? formatDateTime(earliest.date, tzData)
    : earliest.raw;
  elements.earliestMeta.textContent = `${slots.length} open slots · ${locationName}`;
  elements.slotCount.textContent = `${slots.length}`;
  elements.slotsSummary.textContent = `${slots.length} open slots between ${state.prefs.startDate} and ${state.prefs.endDate}.`;
};

const updateLastChecked = () => {
  const now = new Date();
  elements.lastChecked.textContent = formatDateTime(now);
};

const fetchLocations = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/locations`);
    if (!response.ok) {
      throw new Error("Failed to fetch locations");
    }

    const payload = await response.json();
    state.locations = payload.locations || [];

    state.locations.forEach((location) => {
      const option = document.createElement("option");
      option.value = location.id;
      option.textContent = location.name;
      option.dataset.tz = location.tzData;
      option.dataset.name = location.name;
      elements.locationSelect.appendChild(option);
    });
  } catch (error) {
    setNotice("Unable to load locations. Check that the API server is running.", "alert");
  }
};

const fetchSlots = async ({ context = "poll", previousSnapshot } = {}) => {
  if (!state.prefs) {
    return null;
  }

  const snapshot = previousSnapshot || captureSnapshot();
  const params = new URLSearchParams({
    locationId: state.prefs.locationId,
    startDate: state.prefs.startDate,
    endDate: state.prefs.endDate,
  });

  try {
    const response = await fetch(`${API_BASE}/api/slots?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch slots");
    }

    const payload = await response.json();
    const slots = payload.slots || [];

    renderSlots(slots);
    updateLastChecked();

    const earliestKey = slots[0]?.timestamp || slots[0]?.startTimestamp || null;
    const hasChange =
      earliestKey !== snapshot.earliestKey || slots.length !== snapshot.total;

    if (context === "manual") {
      if (hasChange) {
        setNotice("New slot activity detected. Updated list below.", "success");
      }
    } else if (
      earliestKey &&
      state.lastEarliestKey &&
      earliestKey !== state.lastEarliestKey
    ) {
      setNotice("New earliest slot detected. Review the list below.", "success");
    }

    state.lastEarliestKey = earliestKey || state.lastEarliestKey;
    state.lastSlotCount = slots.length;

    if (!slots.length && context !== "manual") {
      setNotice("No open slots right now. We will keep checking.");
    }

    return { slots, hasChange };
  } catch (error) {
    setNotice("Slots request failed. Check your dates and try again.", "alert");
    return null;
  }
};

const startMonitoring = () => {
  if (!validateForm()) {
    return;
  }

  const selectedOption = elements.locationSelect.selectedOptions[0];
  state.prefs = {
    locationId: elements.locationSelect.value,
    startDate: elements.startDate.value,
    endDate: elements.endDate.value,
    tzData: selectedOption?.dataset?.tz || "",
    locationName: selectedOption?.dataset?.name || "",
  };

  localStorage.setItem("ged_prefs", JSON.stringify(state.prefs));
  localStorage.setItem("ged_running", "true");

  setStatus(true);
  setNotice("Monitoring started. We'll refresh every minute.", "success");

  fetchSlots({ context: "poll" });
  clearInterval(state.pollTimer);
  state.pollTimer = setInterval(() => fetchSlots({ context: "poll" }), 60000);

  if (!state.syncingFromExtension) {
    sendExtensionMessage("WEB_START", state.prefs);
  }
};

const stopMonitoring = () => {
  clearInterval(state.pollTimer);
  state.pollTimer = null;
  localStorage.setItem("ged_running", "false");
  setStatus(false);
  setNotice("Monitoring stopped. You can adjust settings any time.");

  if (!state.syncingFromExtension) {
    sendExtensionMessage("WEB_STOP");
  }
};

const startMonitoringFromExtension = (prefs = {}) => {
  state.syncingFromExtension = true;

  if (prefs.locationId) {
    elements.locationSelect.value = prefs.locationId;
  }
  if (prefs.startDate) {
    elements.startDate.value = prefs.startDate;
  }
  if (prefs.endDate) {
    elements.endDate.value = prefs.endDate;
  }
  if (prefs.tzData) {
    elements.tzInfo.textContent = prefs.tzData;
  } else {
    updateTimezoneInfo();
  }

  state.prefs = {
    locationId: prefs.locationId || elements.locationSelect.value,
    startDate: prefs.startDate || elements.startDate.value,
    endDate: prefs.endDate || elements.endDate.value,
    tzData: prefs.tzData || "",
    locationName: prefs.locationName || "",
  };

  localStorage.setItem("ged_prefs", JSON.stringify(state.prefs));
  localStorage.setItem("ged_running", "true");

  setStatus(true);
  setNotice("Monitoring synced from extension.", "success");

  fetchSlots({ context: "poll" });
  clearInterval(state.pollTimer);
  state.pollTimer = setInterval(() => fetchSlots({ context: "poll" }), 60000);

  state.syncingFromExtension = false;
};

const stopMonitoringFromExtension = () => {
  state.syncingFromExtension = true;

  clearInterval(state.pollTimer);
  state.pollTimer = null;
  localStorage.setItem("ged_running", "false");
  setStatus(false);
  setNotice("Monitoring stopped in extension.", "");

  state.syncingFromExtension = false;
};

const refreshOnce = async () => {
  if (!validateForm()) {
    return;
  }

  const selectedOption = elements.locationSelect.selectedOptions[0];
  state.prefs = {
    locationId: elements.locationSelect.value,
    startDate: elements.startDate.value,
    endDate: elements.endDate.value,
    tzData: selectedOption?.dataset?.tz || "",
    locationName: selectedOption?.dataset?.name || "",
  };

  const refreshStartedAt = Date.now();
  setNotice("Refreshing slot availability.");
  const snapshot = captureSnapshot();
  const token = ++state.manualRefreshToken;
  clearTimeout(state.manualRefreshTimer);

  const result = await fetchSlots({
    context: "manual",
    previousSnapshot: snapshot,
  });
  if (!result) {
    return;
  }

  if (result.hasChange) {
    return;
  }

  const elapsed = Date.now() - refreshStartedAt;
  const delay = Math.max(0, 5000 - elapsed);

  state.manualRefreshTimer = setTimeout(() => {
    if (state.manualRefreshToken !== token) {
      return;
    }
    setNotice(
      "No new slots found in the last 5 seconds. The extension will keep refreshing in the background."
    );
  }, delay);
};

const clearSlots = () => {
  elements.slotTableBody.innerHTML = "";
  renderEmptyRow("Slots cleared. Refresh when ready.");
  elements.slotCount.textContent = "0";
  elements.earliestSlot.textContent = "Select a location to begin";
  elements.earliestMeta.textContent = "No slots loaded yet";
  elements.slotsSummary.textContent = "No slots loaded yet.";
  state.lastEarliestKey = null;
};

const loadPreferences = () => {
  const saved = localStorage.getItem("ged_prefs");
  if (!saved) {
    return;
  }

  try {
    const prefs = JSON.parse(saved);
    if (prefs.locationId) {
      elements.locationSelect.value = prefs.locationId;
    }
    if (prefs.startDate) {
      elements.startDate.value = prefs.startDate;
    }
    if (prefs.endDate) {
      elements.endDate.value = prefs.endDate;
    }
    updateTimezoneInfo();
  } catch (error) {
    // Ignore malformed preferences
  }
};

const initialize = async () => {
  const today = getLocalISODate();
  elements.startDate.min = today;
  elements.endDate.min = today;

  await fetchLocations();
  loadPreferences();

  setStatus(false);
  sendExtensionMessage("REQ_STATUS");

  setTimeout(() => {
    if (state.extStatusReceived) {
      return;
    }
    const wasRunning = localStorage.getItem("ged_running") === "true";
    if (wasRunning) {
      startMonitoring();
    }
  }, 800);
};

elements.locationSelect.addEventListener("change", updateTimezoneInfo);

elements.startButton.addEventListener("click", (event) => {
  event.preventDefault();
  startMonitoring();
});

elements.stopButton.addEventListener("click", (event) => {
  event.preventDefault();
  stopMonitoring();
});

elements.refreshButton.addEventListener("click", (event) => {
  event.preventDefault();
  refreshOnce();
});

elements.clearButton.addEventListener("click", (event) => {
  event.preventDefault();
  clearSlots();
});

elements.monitorForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

window.addEventListener("message", (event) => {
  if (event.source !== window) {
    return;
  }
  const data = event.data || {};
  if (data.source !== "ged-ext") {
    return;
  }
  if (data.type === "EXT_STATUS") {
    state.extStatusReceived = true;
    const payload = data.payload || {};
    const prefs = payload.prefs || {};
    if (payload.isRunning) {
      startMonitoringFromExtension(prefs);
    } else {
      stopMonitoringFromExtension();
    }
    return;
  }

  if (data.type === "BOOK_APPT_ACK") {
    if (state.pendingBookingUrl) {
      if (state.bookingWindow && !state.bookingWindow.closed) {
        state.bookingWindow.location = state.pendingBookingUrl;
      } else {
        window.open(state.pendingBookingUrl, "_blank");
      }
      state.pendingBookingUrl = "";
      setNotice("Opening the booking page now.", "success");
    }
  }
});

initialize();
