import { fetchLocations } from "./api/fetchLocations.js";
import { fetchOpenSlots } from "./api/fetchOpenSlots.js";
import { createNotification } from "./lib/createNotification.js";

const ALARM_JOB_NAME = "DROP_ALARM";

let cachedPrefs = {};
let firstApptTimestamp = null;
let cachedRunning = false;

chrome.runtime.onInstalled.addListener((details) => {
	handleOnStop();
	fetchLocations();
});

chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
	const { event, prefs, payload } = data;
	switch (event) {
		case "onStop":
			handleOnStop();
			break;
		case "onStart":
			handleOnStart(prefs);
			break;
		case "bookFromWeb":
			handleBookFromWeb(payload, sendResponse);
			return true;
		case "webStart":
			handleOnStart(prefs || payload || {});
			break;
		case "webStop":
			handleOnStop();
			break;
		case "webStatusRequest":
			replyWithStatus(sendResponse);
			return true;
		default:
			break;
	}
});

chrome.notifications.onClicked.addListener(() => {
	chrome.tabs.create({
		url: "https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=up",
	});
});

chrome.alarms.onAlarm.addListener(() => {
	openSlotsJob();
});

const handleOnStop = () => {
	setRunningStatus(false);
	stopAlarm();
	cachedPrefs = {};
	firstApptTimestamp = null;
	notifyWebAppStatus();
};

const handleOnStart = (prefs) => {
	cachedPrefs = prefs;
	chrome.storage.local.set(prefs);
	setRunningStatus(true);
	createAlarm();
	notifyWebAppStatus();
};

const setRunningStatus = (isRunning) => {
	cachedRunning = isRunning;
	chrome.storage.local.set({ isRunning });
};

const createAlarm = () => {
	chrome.alarms.get(ALARM_JOB_NAME, (existingAlarm) => {
		if (!existingAlarm) {
			// immediately run the job
			openSlotsJob();
			chrome.alarms.create(ALARM_JOB_NAME, { periodInMinutes: 1.0 });
		}
	});
};

const stopAlarm = () => {
	chrome.alarms.clearAll();
};

const openSlotsJob = () => {
	fetchOpenSlots(cachedPrefs).then((data) => handleOpenSlots(data));
};

const handleOpenSlots = (openSlots) => {
	if (
		openSlots &&
		openSlots.length > 0 &&
		openSlots[0].timestamp != firstApptTimestamp
	) {
		firstApptTimestamp = openSlots[0].timestamp;
		createNotification(openSlots[0], openSlots.length, cachedPrefs);
	}
};

const notifyWebAppStatus = () => {
	chrome.tabs.query({ url: ["http://localhost:5500/*"] }, (tabs) => {
		if (!tabs || tabs.length === 0) {
			return;
		}
		const payload = {
			isRunning: cachedRunning,
			prefs: cachedPrefs,
		};
		tabs.forEach((tab) => {
			if (!tab.id) {
				return;
			}
			chrome.tabs.sendMessage(tab.id, { type: "EXT_STATUS", payload });
		});
	});
};

const replyWithStatus = (sendResponse) => {
	chrome.storage.local.get(
		["isRunning", "locationId", "startDate", "endDate", "tzData", "locationName"],
		(result) => {
			sendResponse({
				type: "EXT_STATUS",
				payload: {
					isRunning: result.isRunning || false,
					prefs: {
						locationId: result.locationId,
						startDate: result.startDate,
						endDate: result.endDate,
						tzData: result.tzData,
						locationName: result.locationName,
					},
				},
			});
		}
	);
};

const handleBookFromWeb = (payload = {}, sendResponse) => {
	const { locationId, locationName, slotTimestamp, slotDisplay, tzData, selector } =
		payload;
	chrome.storage.local.set({
		pendingSlot: {
			locationId,
			locationName,
			slotTimestamp,
			slotDisplay,
			tzData,
		},
		bookingTarget: {
			locationId: locationId || "",
			locationName: locationName || "",
			selector: selector || "",
		},
	});

	if (sendResponse) {
		sendResponse({ ok: true });
	}
};
