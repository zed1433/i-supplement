# Roadmap

- [x] Add browser-locale region suggestion, first-visit confirmation, cookie persistence, and manual override
- [x] Refactor shared design tokens and public shopping surfaces to the light Clinical Utility theme
- [x] Rebuild sticky header with catalogue search, region control, compare, and basket counter
- [x] Add quick filters and responsive four/two-column catalogue grid
- [x] Redesign product cards with retailer price comparison and honest unit value
- [x] Add coordinated mobile basket/checkout trigger with 44px touch targets
- [x] Update catalogue metadata and verify desktop/mobile flows
- [x] Add biochemical synergy recommendations, timing cautions, quick view, and safe basket actions
- [x] Add structured package data and dynamic value metrics across all shopping views
- [x] Polish retailer cards, synergy visuals, and sticky catalog-group navigation
- [x] Affiliate/legal compliance: About page, footer compliance block, GDPR/CCPA privacy, expanded terms, outbound-link audit

- [x] Cookie consent banner (accept all / reject non-essential / customize) with stored choice, footer "Cookie settings" re-open, consent-gated affiliate click references, FDA/EFSA disclaimer in footer + co-factors module, "Prices accurate as of ... subject to change by retailer" wording.

- [x] Internationalization: market/currency/language selector, FX conversion, translated UI, geo-targeted affiliate handoff
- [x] Add local-first regional inventory with clearly labelled global fallback
- [x] Replace generic product-card action with explicit retailer rows and add feedback
- [x] Add an app-wide retailer-grouped cart drawer and verified multi-item handoff links
- [x] Standardize deterministic UTC price-sync messaging across shopping surfaces
- [x] Publish operator details in the footer, legal pages, and a dedicated contact page

- [x] Owner access: email/password sign-in, footer Admin link, admin-email signup shortcut, editable affiliate identifier settings page
- [x] Fix Amazon confirmation messaging and preserve direct iHerb affiliate destinations
- [x] Rework phone catalogue cards for complete names and readable retailer choices

- Added five staple comparison pages (creatine, whey isolate, magnesium, D3+K2, omega-3) with buying guides, desktop tables, phone cards, retailer offers and SEO metadata.
- [x] Upgrade the 50 imported iHerb products with high-resolution front, gallery, and readable label photos
- [x] Add mobile/desktop product card carousels and full product-page galleries with zoom
- [x] Add owner controls for reviewing, reordering, replacing, and removing product photos
- [x] Bulk importer reads semicolon iHerb CSV exports (column aliases, auto category/form, batched import)
- [x] Nutrition calculator at /calculator: verbatim engine port, meal builder, analysis, supplements, health context, targets, catalogue cross-links
- [x] Calculator: 4,000+ extra foods (USDA, CIQUAL, Open Food Facts), region/origin/type filters, live food search
- [x] Full nutrient + anti-nutrient profile for every calculator food (status: measured / measured zero / absent by biology / estimated / unknown), animal/plant routing, phytate/oxalate/tannin effects live
- [x] Formula review report (docs/formula-review.md): GitHub formulas (source of truth) vs published research, legacy Supabase alongside
- [x] 88 legacy foods — owner dropped this
- [x] Add legacy preparation methods (heat retention + anti-nutrient reduction)
- [x] Diet type setting (legacy dietary_modifier_rules)
- [x] Under-5 g fat warning + absorbed-calories figure
- [x] Import owner's old meal history — owner said no, skipped
- [x] Online saving for signed-in visitors (calculator_workspaces)
- [ ] Widen anti-nutrient coverage with published phytate/oxalate/tannin tables (USDA proanthocyanidin DB, Phenol-Explorer)
- [x] Fix wrong legacy plant zeros (e.g. soybean/sesame oxalate) with published values
- [x] Verify creatine/taurine values; cooked-meat values only from published cooked measurements
- [ ] Chromium/molybdenum/biotin from published composition studies
- [ ] Meat mineral gaps filled only from same-cut lab tables
- [x] Full calculator feature check (desktop + phone), fix breakages
- [x] Phone menu closes after picking a section (was covering the page)
- [x] Apply evidence-review corrections to absorption formulas and legacy extras
- [x] Spinach oxalate filled
- [x] Published oxalate values (Noonan & Savage 1999; Massey 2001) — spinach, soy, sesame, beets, purslane, amaranth, parsley, cashew, cocoa
- [x] 88 legacy foods as 'My database' — dropped by owner
- [x] Published phytate values (Schlemmer 2009) for 91 grains, legumes, nuts and seeds
- [ ] Tannins from USDA proanthocyanidin DB / Phenol-Explorer
- [x] Calculator: biomarkers drive absorption (ferritin, vitamin D), unit handling, new bars (band, RDA, UL zone, best-case ghost bars), state-aware health context, sex/age targets, evidence-only diet rules
- [ ] More tannin sources beyond USDA (Phenol-Explorer, cereal/legume tables) — still to search

- [x] Restore owner optimal ranges; fixed RDA; absorbed/bioactive targets; needs-based optimal (kcal, macros, weight, activity, diet, biomarkers)
- [x] Suspected low stomach acid affects iron/B12; fibre as inhibitor; graded low-fat effect
- [ ] Track PUFA per food so vitamin E need can follow polyunsaturated fat
- [ ] Wider physiology audit (all interaction combinations, conversion steps) — owner to review list
- [x] Fixed bar scale (RDA 35%, opt 49/70%, UL 95%), values on bars, derived UL on absorbed/bioactive, nutrient order, zero instead of "Not modeled", chloride
- [x] Supplement forms: every published form incl. patented/branded, with cited rates
- [x] Disease audit (needs + absorption), menstruation iron
- [x] Supplements: each form line calculated on its own; meal effects per form; shared B12 cap
- [x] Supplement → other-nutrient need rules (per form, cited)
- [x] "Perfect day" generator with infeasible / condition-blocked reporting
