(() => {
  const CONFIRM_TEXT = "Choose This Location";

  const normalize = (value) =>
    (value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const isVisible = (el) => !!(el && el.offsetParent);

  const clickTarget = (target) => {
    if (!target) {
      return false;
    }
    const clickable =
      target.closest("button, a, [role=\"button\"], li") || target;
    clickable.click();
    return true;
  };

  const findLocationAnchor = (locationName) => {
    if (!locationName) {
      return null;
    }
    const scope = document.querySelector(".content-panel") || document.body;
    const candidates = Array.from(scope.querySelectorAll("a.centerDetails"));
    const normalizedTarget = normalize(locationName);

    return (
      candidates.find((el) => normalize(el.textContent).includes(normalizedTarget)) ||
      candidates.find((el) =>
        normalize(el.getAttribute("aria-label")).includes(normalizedTarget)
      ) ||
      null
    );
  };

  const findLocationBySelector = (selector) => {
    if (!selector) {
      return null;
    }
    return document.querySelector(selector);
  };

  const findConfirmButton = (anchorId) => {
    if (anchorId && anchorId.startsWith("centerDetails")) {
      const popoverId = anchorId.replace("centerDetails", "popover");
      const popover = document.getElementById(popoverId);
      if (popover) {
        const button = popover.querySelector("button#btnChooseLocation, button.btn.btn-primary");
        if (button && isVisible(button)) {
          return button;
        }
      }
    }

    const scope = document.querySelector(".content-panel") || document.body;
    const buttons = Array.from(scope.querySelectorAll("button"));
    const normalizedConfirm = normalize(CONFIRM_TEXT);

    return (
      buttons.find(
        (btn) =>
          isVisible(btn) &&
          normalize(btn.textContent).includes(normalizedConfirm)
      ) || null
    );
  };

  const run = (bookingTarget) => {
    let hasClickedLocation = false;
    let lastAnchorId = "";

    const attemptSelect = () => {
      const confirmButton = findConfirmButton(lastAnchorId);
      if (clickTarget(confirmButton)) {
        chrome.storage.local.remove("bookingTarget");
        return true;
      }

      if (hasClickedLocation) {
        return false;
      }

      const selectorTarget = findLocationBySelector(bookingTarget.selector);
      if (clickTarget(selectorTarget)) {
        hasClickedLocation = true;
        lastAnchorId = selectorTarget.id || "";
        return false;
      }

      const nameTarget = findLocationAnchor(bookingTarget.locationName);
      if (clickTarget(nameTarget)) {
        hasClickedLocation = true;
        lastAnchorId = nameTarget.id || "";
      }

      return false;
    };

    const observer = new MutationObserver((mutations, obs) => {
      if (attemptSelect()) {
        obs.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    attemptSelect();
  };

  chrome.storage.local.get(["bookingTarget"], (result) => {
    const bookingTarget = result.bookingTarget;
    if (!bookingTarget) {
      return;
    }
    run(bookingTarget);
  });
})();
