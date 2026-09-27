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
