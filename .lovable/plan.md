# Your calculator's Supabase project: what's in it and what to bring over

## What your files show
Your Supabase project is an older, separate version of your calculator with its own formulas. The GitHub app was never connected to it. It contains:

- **6 functions:**
  - `calculate_meal_bioactive_profile`, in two versions. It works out what a meal gives you after absorption, adjusting for phytate, oxalate, fiber, tannins, fat (fat-soluble vitamins need at least 5 g), lectins left after cooking, competition between minerals (zinc/copper, calcium/magnesium), calorie absorption, and diet type.
  - `calculate_cooked_plate` and `calculate_preparation_yield` estimate how much of each nutrient survives cooking.
  - `get_metabolic_telemetry_history` and `bulk_insert_daily_logs` handle daily meal history.
- **About 20 tables:** foods and nutrient values, cooking methods and how much of each nutrient survives them, how foods affect each other's absorption, diet rules, daily targets, supplements, blood test results, meal logs, saved meal presets and user settings.

Only the table layouts and function code were exported, not the rows. The numbers inside (absorption rates, cooking factors, food values) are still in your Supabase project.

## What I recommend
1. **Get the data.** Export the rows of the tables that hold numbers: `foods`, `food_micronutrients`, `food_nutrients`, `nutrients_definition`, `preparation_methods`, `cooking_methods`, `cooking_retention_factors`, `nutrient_interactions`, `food_matrix_interactions`, `matrix_interactions`, `dietary_modifier_rules`, `nutrient_forms`, `nutrient_daily_targets`, `supplements`. In Table Editor, open each table and use Export, then CSV. Upload the files here.
2. **Compare before changing anything.** I'll put the old formulas next to your current calculator's (the rebuilt GitHub version) and show you, nutrient by nutrient, where they agree and where they differ. Your current formulas stay unless you choose otherwise.
3. **Add only what's missing,** with your approval. Likely candidates the current calculator lacks:
   - lectins left after cooking
   - the calorie-absorption figure
   - the "under 5 g fat" warning for fat-soluble vitamins
   - diet-type rules (carnivore, standard and others)
4. **Online saving for signed-in visitors.** Their meal history, presets, blood tests and settings get saved in this site's backend, replacing your old `daily_meal_logs`, `saved_meal_presets`, `blood_biomarkers` and `user_settings` tables. Visitors who don't sign in keep saving in their browser. Each person sees only their own data.

Your personal rows (meal logs, blood tests) can be imported into your account here too, if you want them.

## Technical details
- Reference data goes into a static JSON file under `public/bio-calculator/` (same pattern as `extra-foods.json`). It's public, read-only and needs no database writes.
- New formulas go in a separate module next to `clinical-absorption.js`, with tests, and are never mixed into the verbatim engine files.
- User data: one table `calculator_workspaces` (user_id uuid primary key, data jsonb, updated_at) with grants, RLS limited to own row, and a merge rule where the newer copy wins on first sign-in. The iframe talks to the parent page via postMessage, and the parent reads and writes with the site's client.
- Old SECURITY DEFINER functions with no user checks (`bulk_insert_daily_logs`) are not copied as-is.
