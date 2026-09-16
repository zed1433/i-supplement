# Affiliate and legal compliance overhaul

Privacy and Terms pages already exist and are linked in the footer. This pass adds the missing About/contact page, upgrades the footer into a proper compliance block, strengthens the two legal pages for GDPR/CCPA, and audits every outbound retailer link.

## 1. New About page

A `/about` page explaining: what the platform is (independent comparison of supplement price and quality), how products are ranked (elemental dose, chemical form, third-party testing, price), that we sell nothing and take no payment, how prices are gathered and refreshed, and how we make money. Ends with a contact block using isupplementsofficial@gmail.com for support, corrections and data requests. Own title/description for search and link previews, and included in the sitemap.

## 2. Footer compliance block

The footer gains a visually distinct bordered block, on every page, with two clearly headed paragraphs:

- **Disclosure** — "We are an independent comparison platform. We may earn an affiliate commission when you purchase through links on our site at no extra cost to you. As an Amazon Associate, we earn from qualifying purchases."
- **FDA & EFSA Disclaimer** — the full medical disclaimer: educational information only, not medical advice, supplements are not intended to diagnose, treat, cure or prevent any disease, consult a qualified healthcare professional first.

Below it the footer link row carries working links to About Us, Privacy Policy, Terms of Service, Affiliate Disclosure, and Contact (the support email), alongside the existing Catalogue / Compare / Basket links.

The same Amazon Associates sentence is added to the top-of-page disclosure strip and the affiliate disclosure page so the wording matches everywhere.

## 3. Privacy and Terms strengthening

Privacy policy gains explicit GDPR/CCPA sections: legal basis for each use, the named rights (access, correction, deletion, portability, objection, "do not sell or share" — we sell nothing), retention periods, who data is shared with, and how to exercise rights by email with a 30-day response commitment. Cookie/local-storage use is listed item by item (region, basket, sign-in session) with the note that none of it is advertising tracking.

Terms gains sections on acceptable use, intellectual property and third-party trademarks, changes to the terms, and governing law, on top of the existing comparison-service, pricing, returns, affiliate and medical-advice sections.

## 4. Catalog and outbound-link audit

- Sweep the whole app for placeholder or dummy copy; anything found is replaced with the real product facts already in the database (name, form, elemental dose per serving, servings, price, retailer).
- Check every buy/add/continue action on cards, product pages, compare, quick view and basket: each must resolve to a real retailer destination through the affiliate redirect, never an empty link. Any offer without a verified destination is not shown as buyable.
- Layout of the new and changed pages checked at mobile and desktop widths.

## Technical notes

- New `src/routes/about.tsx` with `staticData: { sitemap: true }` and `head()` metadata, matching the existing legal-page shell.
- `src/components/suppcheck/SiteFooter.tsx`: compliance block + link row incl. `mailto:` contact; `AffiliateNotice.tsx` and `src/lib/suppcheck.ts` (`AFFILIATE_DISCLOSURE`, new `MEDICAL_DISCLAIMER`) updated for consistent wording.
- `src/routes/privacy.tsx`, `src/routes/terms.tsx`, `src/routes/affiliate-disclosure.tsx` content expanded; no schema or data changes.
- Audit via repo-wide search for placeholder strings and `href="#"`, then a browser pass over catalogue, product, compare and basket confirming outbound links hit `/api/affiliate/redirect/...`.
