# Show every food in the Meal builder list

## What's happening
All 87 foods from your app are on the site. The "Base food" list in the Meal builder only shows the first 30 alphabetically (it stops at Chickpeas). Your original app on GitHub has the same 30 limit. The other foods only show up when you type in the search box or pick a category.

## Fix
- Remove the 30-food limit so the list shows all 87 foods, A to Z.
- Search and category filters still narrow the list as before.
- Nothing else in the calculator is removed or changed.

## Customizations
Your saved meals, supplements, biomarkers and settings live in the browser where you used the original app. A new website address starts empty, so they don't carry over on their own. If something else you built is missing (a screen, a button, an option), tell me what it is and I'll bring it back.

## Technical details
- `public/bio-calculator/app.js`, `builder()`: drop `.slice(0,30)` on `matches`.
- Check in the browser that the list ends at the last food alphabetically.
