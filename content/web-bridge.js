(() => {
  const isSafeMessage = (event) => {
    if (event.source !== window) {
      return false;
    }
    const data = event.data || {};
    return data.source === "ged-web" && typeof data.type === "string";
  };

  window.addEventListener("message", (event) => {
    if (!isSafeMessage(event)) {
      return;
    }

    const { type, payload } = event.data;

    if (type === "BOOK_APPT") {
      chrome.runtime.sendMessage({
        event: "bookFromWeb",
        payload: payload || {},
      });

      window.postMessage(
        {
          source: "ged-ext",
          type: "BOOK_APPT_ACK",
        },
        "*"
      );
      return;
    }

    if (type === "WEB_START") {
      chrome.runtime.sendMessage({
        event: "webStart",
        prefs: payload || {},
      });
      return;
    }

    if (type === "WEB_STOP") {
      chrome.runtime.sendMessage({ event: "webStop" });
      return;
    }

    if (type === "REQ_STATUS") {
      chrome.runtime.sendMessage(
        { event: "webStatusRequest" },
        (response) => {
          if (response && response.type === "EXT_STATUS") {
            window.postMessage(
              {
                source: "ged-ext",
                type: "EXT_STATUS",
                payload: response.payload || {},
              },
              "*"
            );
          }
        }
      );
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.type === "EXT_STATUS") {
      window.postMessage(
        {
          source: "ged-ext",
          type: "EXT_STATUS",
          payload: message.payload || {},
        },
        "*"
      );
    }
  });
})();
