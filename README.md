# Visa Slot Monitor

A Chrome Extension that monitors the U.S. Customs and Border Protection (CBP) Trusted Traveler Program API for open Global Entry interview appointment slots. It polls for availability every 60 seconds and sends desktop notifications when new slots are found.

Global Entry interviews are notoriously hard to book — slots fill up within minutes and new ones appear unpredictably. This extension automates the monitoring so you don't have to manually refresh the government scheduler.

## How It Works

1. **Select** an enrollment center location and a date range from the extension popup
2. **Start** monitoring — the service worker sets a recurring alarm that polls the TTP API every minute
3. **Get notified** — when open slots appear, a desktop notification fires with the appointment time and timezone
4. **Book** — click the notification to jump directly to the CBP scheduling page

### Architecture

```
popup/popup.js          → User interface (location picker, date validation, start/stop)
background.js           → Service worker (alarm scheduling, polling orchestration)
api/fetchLocations.js   → Fetches enrollment centers from TTP API
api/fetchOpenSlots.js   → Fetches available slots for a location + date range
lib/createNotification.js → Creates Chrome desktop notifications
```

## Tech Stack

- **Chrome Extension Manifest V3** — service workers, chrome.alarms, chrome.storage, chrome.notifications
- **Vanilla JavaScript** — no frameworks, no build step
- **CBP TTP API** — `ttp.cbp.dhs.gov/schedulerapi`
- **Spacetime.js** — timezone-aware date validation

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/omariomari2/code2040.git
   ```
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the cloned directory
5. Pin the extension from the toolbar for easy access

## Usage

1. Click the extension icon in the Chrome toolbar
2. Select a Global Entry enrollment center from the dropdown
3. Set a start and end date for your desired appointment window
4. Click **Save & Start**
5. The extension will poll every 60 seconds — you'll receive a desktop notification when a slot opens up
6. Click the notification to open the CBP scheduler and book the slot

## API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /schedulerapi/locations/` | List all operational Global Entry enrollment centers |
| `GET /schedulerapi/locations/{id}/slots` | Fetch open appointment slots for a location and date range |

## Project Structure

```
├── manifest.json              # Extension config (permissions, service worker, icons)
├── background.js              # Service worker — alarm loop & slot polling
├── api/
│   ├── fetchLocations.js      # Fetches enrollment center list from CBP
│   └── fetchOpenSlots.js      # Fetches open slots, filters for active ones
├── lib/
│   └── createNotification.js  # Desktop notification builder
├── popup/
│   ├── popup.html             # Extension popup UI
│   ├── popup.js               # Form handling, validation, Chrome messaging
│   ├── bulma.min.css          # CSS framework
│   └── spacetime.min.js       # Date/timezone library
└── images/                    # Extension icons (16, 32, 48, 128px)
```

## License

MIT
