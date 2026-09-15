# Fix: catalogue stuck on empty grey boxes

## What your screenshot shows

The grey boxes are the "still loading" placeholders, and the "0 products" counter plus the empty
Category list and all-zero certification counts confirm the same thing: the page never received the
product list on that visit.

Loaded fresh in a clean browser right now, the same page renders all 38 products with photos,
prices and categories, and reports no errors. So this is not a permanent break in the page — it is
a load that stalled and then had no way to recover or tell you what went wrong.

## What is actually wrong

1. The product list is fetched only after the page appears in the browser. If that one request is
   slow or fails momentarily, the page sits on grey boxes indefinitely.
2. While it is loading, the counter still says "0 products" and the category menu renders empty —
   so a slow load looks identical to "the catalogue is empty".
3. A failed request silently retries behind the scenes with no message and no way for you to retry
   manually.

## The fix

1. **Load the catalogue with the page, not after it.** The home page will fetch products on the
   server as part of rendering, so products are already in the HTML on first paint. This removes
   the grey-box state for almost every visit and also helps search engines see the products.
2. **Honest loading state.** While loading, the counter says "Loading catalogue…" instead of
   "0 products", and the category menu shows placeholder rows rather than looking empty.
3. **Visible failure and manual retry.** If the fetch fails, show a short plain message ("We could
   not load the catalogue") with a "Try again" button, instead of endless placeholders.
4. **Stop the silent stall.** Cap the automatic retries and give the request a timeout so it either
   succeeds, or shows the error state quickly.
5. **Same treatment on the product, compare and basket pages** so none of them can hang on a blank
   state either.

## Technical notes

- Add `loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery)` to
  `src/routes/index.tsx` and keep the component on `useQuery(productsQuery)` so hydration reuses the
  server-fetched data.
- In `productsQuery` (`src/lib/suppcheck.ts`): set `retry: 2`, `staleTime`, and an `AbortSignal`
  timeout so a hung request resolves into an error state.
- In `src/routes/index.tsx`: replace the `{filtered.length} products` line with a loading-aware
  label, add skeleton rows to the category sidebar while `isLoading`, and give the `error` branch a
  `Try again` button wired to `refetch()`.
- Verify afterwards with a browser run of `/`, a product page, `/compare` and `/basket`, checking
  the product grid renders and the console is clean.
