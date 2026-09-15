# Smooth, instant category filtering

Right now choosing a category updates the list correctly, but the products vanish and reappear in a hard jump, which feels like the page reloading. The list should behave exactly like typing in the search box: results update on the spot and the remaining products glide into their new positions.

## What changes

1. **Animated product grid**
   - Products that no longer match fade and shrink out instead of disappearing instantly.
   - Products that stay slide smoothly to their new spot in the grid.
   - New products fade in.
   - All of it happens in one continuous motion, around a quarter of a second.

2. **No page jump**
   - The page keeps its scroll position when a category is picked; nothing snaps to the top.
   - The grid area keeps its space while the list changes, so the page below does not jerk.

3. **Sidebar drilldown feels like one movement**
   - Moving from group to nutrient to chemical form slides sideways instead of swapping abruptly.
   - Going back slides the other way.
   - Counts and breadcrumbs stay as they are today.

4. **Same instant behaviour for every filter**
   - Category, chemical form, certification checkboxes, sorting and search all use the same smooth update, so the whole page feels consistent.

5. **Respect reduced motion**
   - If the device has "reduce motion" turned on, updates happen instantly with no animation.

## Technical notes

- Add the `motion` package (Motion for React).
- In `src/routes/index.tsx`, wrap the product grid in `AnimatePresence` with `motion.div` wrappers around each `ProductCard`, keyed by product id, using `layout` plus fade/scale enter and exit variants.
- Wrap the sidebar level content (`FilterPanel` group / nutrient / form views) in `AnimatePresence mode="wait"` with a horizontal slide keyed by the active level.
- Keep filtering fully client-side in the existing `useMemo`; no query, route or search-param changes, so nothing refetches.
- Use `useReducedMotion()` to disable transitions when requested.
