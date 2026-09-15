# Fix: Edit and Bulk import buttons do nothing

## What's wrong

The buttons are wired correctly, but the admin list page is registered as the *parent* of the edit and import pages. When you click Edit or Bulk import, the address changes but the parent page has no slot for child content, so the same product list stays on screen and nothing appears to happen.

## The fix

Split the admin area into a thin container plus a list page:

1. Turn the current admin page into a container that renders whichever admin screen is active.
2. Move the product-list table (heading, Bulk import button, Sign out, table with Edit buttons) into its own index screen at `/admin`.
3. Leave the edit screen and the import screen unchanged — they start rendering as soon as the container has a slot.

## Verification

- Load `/admin`, confirm the product table still shows with counts and verified badges.
- Click Edit on a product: the product editor loads at `/admin/product/<slug>`.
- Click Bulk import: the CSV/XLSX import screen loads at `/admin/import`.
- Confirm going back to `/admin` shows the table again.

## Technical notes

- `src/routes/_authenticated/admin.tsx` becomes a layout route: `component` renders `<Outlet />` only, keeping the existing `head()` meta.
- New `src/routes/_authenticated/admin.index.tsx` holds the current `AdminPage` body (bootstrap query, catalog query, sign-out, table).
- `admin.import.tsx` and `admin.product.$slug.tsx` are untouched; route tree regenerates automatically.
- No database, auth, or public catalogue changes.
