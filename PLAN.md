# Prismate Extension — Fix Plan

## Status

Implementation and static validation are complete. Manual Chrome verification remains because the unpacked extension is not installed in the available browser session.

## 1. Fix the execution flow

- Remove the automatic `content.js` execution from `manifest.json`.
- Let the service worker send messages when the toolbar icon is clicked.
- Make the content script initialize silently and avoid duplicate setup.

## 2. Harden filter selection

- Replace fragile `prompt()` parsing with strict validation.
- Safely handle invalid, negative, empty, and cancelled input.
- Add a clear off/reset state.
- Restrict filter lookup to the extension’s own SVG definitions.

## 3. Improve page compatibility

- Handle pages where `document.body` is not yet available.
- Avoid errors on restricted pages such as `chrome://` pages and the Chrome Web Store.
- Catch and report `executeScript` or messaging failures in the service worker.

## 4. Persist filter state

- Store the selected filter using Chrome storage.
- Decide whether state should persist per tab, per site, or globally.
- Reapply the selected filter after page navigation where appropriate.

## 5. Update project metadata

- Remove redundant permissions if no longer needed.
- Update the README to describe the actual interaction and persistence behavior.
- Bump the extension version and document supported and unsupported pages.

## 6. Add verification

- Add lightweight tests or validation for:
  - filter selection and reset
  - invalid input
  - message handling
  - repeated toolbar clicks
  - page navigation
- Run manifest and JavaScript syntax checks.
- Manually test normal pages, dynamically loaded pages, navigation, restricted pages, and all filter modes.
