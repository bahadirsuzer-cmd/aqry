1. Domain

Primary:

https://aqryo.com

Recommended:

www.aqryo.com -> aqryo.com redirect

Checks:

HTTPS active

HTTP -> HTTPS redirect

www canonical redirect configured

no mixed-content assets

app route fallback configured for SPA

/experience/:id direct URL works after refresh

/creator-auth direct URL works after refresh

/admin direct URL works after refresh

2. Supabase Authentication

Production Site URL:

https://aqryo.com

Redirect URLs to keep:

https://aqryo.com/creator-auth

https://aqryo.com/creator-studio

https://aqryo.com/creator-reset-password

During development localhost may remain as an allowed redirect.

Check:

Confirm email enabled

Anonymous users disabled unless deliberately changed

Google provider enabled

Google OAuth secret rotated if previously exposed

Password reset production redirect works

Signup confirmation production redirect works

3. Google OAuth

Authorized JavaScript origin:

https://aqryo.com

Google callback:

Supabase callback URL

NOT /creator-studio

Expected callback:https://hburwzezggdgxuissjej.supabase.co/auth/v1/callback

Checks:

correct production origin

Supabase callback registered

no localhost-only dependency

client secret not present in frontend repository

old exposed secret revoked

4. SMTP

Before launch:

Custom SMTP/provider selected

Sender domain authenticated

SPF configured

DKIM configured

DMARC considered

From name = AQRYO

Confirm signup email branded

Password reset email branded

delivery tested to Gmail

delivery tested to Outlook

bounce handling understood

Do not claim transactional mail is production-ready while using an unverified/default temporary setup.

5. Frontend Environment

Required public variables:

VITE_SUPABASE_URLVITE_SUPABASE_ANON_KEYVITE_PUBLIC_APP_URL=https://aqryo.com

Never frontend env:

OpenAI secret

Supabase service role

Sipay secret

SMTP password

webhook secret

6. Supabase Edge Function Secrets

Review all server-side secrets:

OpenAI/API provider keys

Sipay credentials

payment webhook secret

Supabase service-role

SMTP/provider secret if used server-side

Checks:

no secrets committed to git

no secrets printed in logs

old leaked credentials rotated

production and sandbox credentials separated

7. Payment Production

Before switching from sandbox:

Live merchant/account approved

live API endpoint confirmed

live callback endpoint confirmed

webhook/signature verification implemented

server-side amount verification

currency verification

duplicate callback idempotency

paid terminal state

failed/cancelled retry

refund design

dispute design

chargeback finance ledger

real payment regression tests

logs contain no card/CVV/3DS secrets

8. Public SEO

homepage title

homepage description

public page descriptions

canonical tags

Open Graph title/description

Open Graph image

Twitter card

robots.txt

sitemap.xml

creator/admin screens noindex

paused/private Experiences noindex

public published Experiences have unique title/description

9. Experience Social Sharing

For a public Experience:

Open Graph should ideally contain:

title

creator/Experience description

cover image

canonical Experience URL

Important:Client-only metadata may not be enough for crawlers that do not execute JavaScript.

If X/WhatsApp/Telegram previews fail:server/edge-generated HTML metadata or prerendering will be required.

Test:

X card

WhatsApp preview

Telegram preview

Discord preview

10. robots.txt

Public:

homepage

examples

public legal pages

published Experiences if crawlable

Private:

/creator-*

/admin

Participant private/payment query URLs should not create canonical duplicates.

11. sitemap.xml

Static public pages can be listed statically.

Published Experience URLs should eventually be dynamically generated.

Do NOT put:

draft

paused

moderated

private

creator internal routesinto sitemap.

12. Error Monitoring

Recommended architecture:

Frontend:

uncaught React/browser errors

route failures

API errors with sanitized context

Edge:

request correlation ID

function name

sanitized error code

order ID when applicable

Do not log:

password

access token

refresh token

OAuth secret

card/CVV

participant private contact unnecessarily

Provider not hardcoded yet.Sentry or equivalent can be added later.

13. Backups / Recovery

Supabase backup/PITR plan understood

database migrations saved in repo

Edge Functions source in repo

production env ownership documented

domain registrar account secured

2FA enabled where supported

Google Cloud 2FA

Supabase account 2FA

payment provider 2FA

14. Legal

Before public launch:

Terms professionally reviewed

Privacy / KVKK reviewed

Creator Terms reviewed

Payment/Gift digital content policy reviewed

Cookie consent decision

company/legal entity details inserted

contact email inserted

refund/cancellation wording matches actual flow

creator payout/tax wording matches actual flow

15. Launch Smoke Tests

Anonymous participant:

public Experience link opens

start

interaction

Result free

Gift flow

Gift does not unlock Offer

Offer purchase

Offer unlock after verified payment

refresh retains correct paid access

report flow

share flow

Creator:

signup email

Google signup/login

password reset

first Experience

publish

pause

republish

moderation lock behavior

earnings

gifts

payments

account settings

Admin:

non-admin denied

admin allowed

reports visible

moderation pause

audit log

orders visible

payout data read-only

16. Launch Decision

Do not launch because "site opens".

Launch only if:

money cannot be created client-side

premium cannot be unlocked client-side

creator cannot read another creator's data

participant private data does not leak

moderation lock works

refunds/disputes have an operational plan

credentials are production-safe