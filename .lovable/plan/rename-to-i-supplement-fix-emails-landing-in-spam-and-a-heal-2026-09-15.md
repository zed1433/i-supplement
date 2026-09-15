# Rename to i-Supplement, fix emails landing in spam, and a health pass

## 1. Rename the site to i-Supplement

Replace the SuppCheck name everywhere it is visible or used:

- Header logo and wordmark
- Browser tab titles, page descriptions and share previews on every page (home, product, compare, basket, admin, sign-in)
- Newsletter signup wording and the footer text inside offer emails
- The sender name on outgoing emails and the "SITE_NAME" value used by the email builder

Nothing about how the site works changes — only the name people see.

## 2. Why the offer emails go to spam, and what we do now

Right now the emails leave from a plain Gmail account and are sent one by one to a list. Mail providers treat that as a classic spam pattern: a personal Gmail address cannot prove it is allowed to send bulk mail for a brand, and the test subject line started with "[TEST]", which is itself a strong spam trigger.

There is no code change that makes a personal Gmail account reliably land in the inbox. What we can do now is remove every avoidable spam signal, so that once the real domain is in place deliverability is good from day one.

Changes in this round:

- Drop the "[TEST]" prefix; test sends get a normal subject and a small "test copy" note inside the email body instead.
- Add the standard bulk-mail headers every provider looks for: a one-click unsubscribe header pointing at the existing unsubscribe link, plus list identification headers.
- Send a proper two-part email (plain-text version alongside the styled version). HTML-only mail is penalised.
- Give the email a real, readable from-name ("i-Supplement") rather than a bare address.
- Slow the send loop slightly and cap each run, so a burst of identical messages does not look like a blast.
- Tighten the email markup: no hidden text, fewer links, no all-caps or exclamation marks in subjects, and a plain visible unsubscribe line (already present, kept).
- Add a short "deliverability" note on the offer-emails admin screen explaining the domain step, so the state is visible rather than a surprise.
- add a button to change our region and dynamically chage the reatilser and the products that can be sent to your door , for example someone in grecee should be able to see the iherb and skroutz products ,and the eurpean products frrom amazon but some on usa shouldnt be able to see the skroutz website and so on

### After you buy i-supplement.com

Once the domain is bought and connected, we switch sending to your own verified sender domain instead of Gmail. That is the step that actually gets you into the inbox, because the domain can be signed and authenticated. It is a small follow-up change on my side; the templates and the admin screen stay the same.

## 3. Security pass

- Run the full security scan and review the findings list with you.
- Re-check that every table is locked down: the public catalogue readable by anyone, subscriber emails and send logs readable by nobody but the server, admin actions rejected on the server for anyone outside the allowlist (not just hidden in the UI).
- Verify the unsubscribe link cannot be used to read or change anyone else's record, and that the scheduled-job endpoints still reject unsigned calls.
- Confirm no secret values are reachable from the browser.
- Address the findings that are real; report the ones that are expected and explain why.

## 4. Optimisation and visibility pass

- Page speed: images sized and lazy-loaded, no oversized bundles on first paint, fonts loaded without blocking.
- Search visibility: unique title and description per page, one main heading per page, descriptive image text, structured product data so search engines can show prices, a sitemap and correct robots rules.
- Catalogue pages: check the product and compare pages load quickly with the full catalogue and that filters do not re-query needlessly.
- Mobile check of the main flows: browse, compare, basket, subscribe.

## Technical notes

- Rename touches `SITE_NAME` in `src/lib/newsletter.server.ts`, the header component, and the `head()` metadata of each route file.
- Email changes are confined to `renderEmail`/`sendCampaign` in `src/lib/newsletter.server.ts` and `sendMail` in `src/lib/gmail.server.ts` (multipart/alternative body, `List-Unsubscribe`, `List-Unsubscribe-Post`, `List-Id`, proper From display name).
- Test sends stop prefixing the subject; the marker moves into the rendered body.
- Domain migration later: swap the Gmail transport for the managed email sender once `i-supplement.com` is verified — the template registry and admin UI are unaffected.
- Security: `security--run_security_scan` plus a review of RLS policies and GRANTs on `products`, `offers`, `subscribers`, `campaigns`, `campaign_sends`, `app_settings`, `cron_config`, `user_roles`.