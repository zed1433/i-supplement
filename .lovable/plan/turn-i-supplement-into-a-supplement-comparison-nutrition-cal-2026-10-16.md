# Turn i-Supplement into a supplement comparison + nutrition calculator site

The catalogue, prices, retailer buttons and links stay exactly as they are. We add your calculator as a main feature and update the home page so the site reads as "compare the cheapest and best supplements, and calculate what you need — all in one place".

## 1. Bring in your calculator
- You share the GitHub repository link (public, or a project in this workspace).
- I read it and rebuild the calculator here so it keeps the same inputs, formulas and results: kcal, macros, micronutrients, relative absorption and the other figures it covers.
- Formulas are copied as written, not reinvented. If anything is unclear or uses a service this site can't run, I'll ask before changing it.

## 2. New Calculator page
- Its own page at /calculator, linked in the top menu and footer.
- Works on phone and desktop, results update as you type.
- Where it makes sense, micronutrient results link to matching supplements in the catalogue (e.g. "low on magnesium → compare magnesium"), using real catalogue data only.
- Own title and description for search and link previews; added to the sitemap.

## 3. Home page
- Headline and intro rewritten around comparison + calculator.
- A clear "Open the calculator" button and a short preview card near the top; the catalogue stays below as now.

## 4. Unchanged
- All products, offers, prices, retailer buttons, affiliate placeholders, the iHerb code NBO7379, basket, compare pages, legal pages and admin.

## Technical notes
- Calculator logic ported into `src/lib/calculator/` as pure functions with tests covering the formulas; UI in `src/routes/calculator.tsx`.
- No database changes unless the calculator stores user data; if it does, that gets its own follow-up decision.
- AGENTS.md gets one rule noting where calculator logic lives.

## Needed from you
The GitHub repository link.
