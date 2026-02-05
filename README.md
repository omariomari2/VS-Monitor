# Global Entry Drops

This repo now includes a standalone web experience alongside the Chrome extension. The web app mirrors the extension functionality, polls for open slots, and shows every available slot in the selected range.

## Web App Structure
- `web/server`: Express API that proxies Global Entry locations and slots.
- `web/client`: Static UI that consumes the API and displays live slots.

## Run The Web App
1. `cd web/server`
2. `npm install`
3. `npm run dev`
4. In a second terminal: `cd web/client` and run a static server, for example:
   - `python -m http.server 5500`
   - or `npx serve -l 5500`
5. Open `http://localhost:5500`.

The client expects the API at `http://localhost:4000` by default. To point to a different API URL, update the `data-api-base` attribute in `web/client/index.html`.
