# Add Awin verification meta tag

## Goal
Add the Awin site-verification tag `<meta name="awin" content="Awin" />` so Awin can verify site ownership.

## Where it goes
This project has no static `index.html` — the document head is rendered by TanStack Start from the root route's `head()` function. The tag must be added there so it appears in the served `<head>` on every page.

## Change
1. In `src/routes/__root.tsx`, inside the existing `meta` array of `head()` (around line 87-104), add:
   `{ name: "awin", content: "Awin" }`
   This renders exactly as `<meta name="awin" content="Awin" />` in the HTML head.

## Verification
- Load the site and confirm the raw HTML contains `<meta name="awin" content="Awin"/>` in the `<head>`.
- Confirm no other meta entries were disturbed and the page still renders without console errors.

## Notes
- No other routes or files change.
- No database or affiliate-configuration changes are needed.
