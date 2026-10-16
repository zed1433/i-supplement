# Rebuild the calculator to match your original app

The current page squeezed your app into 6 horizontal tabs and dropped screens. Rebuild it with your original layout, keeping the new site colors.

## What changes
- Original three-column layout: left sidebar menu, main workspace, right "Live analysis / Meal signals" panel.
- All 9 original sections in the original order and names: Dashboard, Meal builder, Analysis, Foods, Supplements, Biomarkers, History, Targets, Health contexts.
- Top bar like the original: breadcrumb + page title, EN / ΕΛ language switch, "+ Add food" button, local-workspace notice.
- Food detail popup, as in the original.
- Phone: sidebar collapses behind the menu button; right panel moves below the content.
- Saved data keeps working (same browser storage key).
- Site header/footer and colors stay; the horizontal tab bar is removed.

## Technical details
- Port view rendering from `/tmp/biocalc/public/app.js` into React sections in `src/routes/calculator.tsx` (split into `src/components/calculator/*`), using the existing verbatim engine in `src/lib/calculator/`.
- Port English/Greek strings from the original translations.
- Styling via existing semantic tokens only.
- Re-run `scripts/test-calculator.mjs` and check desktop + phone in the browser.
