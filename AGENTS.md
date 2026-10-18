<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Product photos live in `public.product_images` (public read, admin-only writes); keep `products.image_url` synchronized with the primary photo for legacy catalogue surfaces.
- Store sourced product photography as Lovable asset pointers rather than external hotlinks so retailer image transforms do not degrade or disappear.
- The /calculator page embeds the user's original Bio Calculator app verbatim from public/bio-calculator/ (iframe) so its layout and screens match the source repo; only colors and import paths are adapted.
- Extra calculator foods are a static file `public/bio-calculator/extra-foods.json` built by `scripts/build-extra-foods.py` from USDA, CIQUAL and Open Food Facts; each food keeps its source/country (no merging across countries). Live search uses `/api/public/calc-foods` and saves picks only in the visitor's browser — no public database writes.
- Calculator food profiles live in `public/bio-calculator/food-profiles.json`, built by `scripts/build-food-profiles.py`; every value carries a status (M/Z/B/E/U) so unmeasured values are never shown as real zeros, and `food-profiles.js` merges them without overwriting source values. Why: absorption estimates must not treat missing data as zero.

- Absorption formulas in clinical-absorption.js (public + src mirror) and legacy-rules.js follow the owner-approved evidence review in docs/formula-review.md and deliberately diverge from the GitHub repo; change values only with a cited reason and update the review. Keep both clinical-absorption.js copies identical apart from the @ts-nocheck line.
- Calculator logic lives in src/lib/calculator/; calculation-engine, meal-service and catalogs are verbatim ports of the user's Bio Calculator repo — change those formulas only in the source repo, then re-copy.
