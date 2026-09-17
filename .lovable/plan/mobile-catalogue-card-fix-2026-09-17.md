# Mobile catalogue card fix

## Scope
Improve only the main supplement browsing page on phones. The individual product page will remain unchanged.

## Changes
- Switch the phone catalogue from two squeezed cards per row to one full-width product card per row; keep the existing multi-column desktop layout.
- Rebuild each phone card around the selected Clear commerce layout: compact product image beside identity, followed by a clearly separated retailer-choice area.
- Remove the two-line cut-off from product names on phones so the complete name wraps naturally; retain a compact desktop treatment where appropriate.
- Reorganize the information into a clear reading order: category and brand, full product name, essential form/serving/testing facts, retailer choices, value information, then actions.
- Replace compressed retailer button contents with responsive rows that always show the full merchant name and price. Place “Best deal” in a dedicated badge and allow the confirmation message to wrap rather than truncate.
- Remove duplicated price emphasis and shorten the repetitive basket explanation from every card, while preserving price freshness, conversion notices, and affiliate behavior.
- Give Quick view and Full details clear text labels on phones instead of icon-only controls.
- Keep all existing basket, compare, regional pricing, verified-offer, animation, and filtering behavior unchanged.

## Validation
- Check the catalogue at a 390 × 844 phone viewport with long supplement and retailer names.
- Confirm no title, merchant, price, badge, or action text is clipped and there is no horizontal page overflow.
- Confirm adding each retailer offer still opens the grouped basket and compare, Quick view, and Full details still work.
- Recheck desktop catalogue cards to ensure the responsive changes do not disrupt the existing grid.
