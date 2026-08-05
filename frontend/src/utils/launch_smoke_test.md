AQRYO Launch Smoke Test

Use this after production deployment.

A. Public Website

https://aqryo.com loads

mobile layout works

login link works

examples works

how-it-works works

AI credits works

pricing works

legal routes work

no console crash

no broken images

B. Auth

Email:

signup

verification mail

verification redirect

login

logout

password reset

invalid reset URL blocked

Google:

Google login

callback completes

creator redirected correctly

existing account behavior understood

C. Creator

new creator onboarding

create Experience

AI generation

manual editing

preview

publish

copy link

X share

WhatsApp share

Telegram share

QR if retained

pause

republish

moderation-paused cannot republish

D. Participant

published Experience opens

draft does not

paused does not

archived does not

moderated does not leak reason

view event

start event

completion saves

result free

E. Gift

Catalog:

Coffee 29 TL

Heart 99 TL

Crown 249 TL

Rocket 999 TL

no Rose

Flow:

Gift checkout starts

payment success

thank-you UI

Gift does NOT unlock Offer

repeat Gift allowed

creator Gifts inbox receives item

contact data only if supplied

F. Offer

Offer price 9 TL

creator cannot change price

Offer after free Result

checkout

paid Offer unlocks

failed Offer does not unlock

cancelled Offer does not unlock

duplicate paid Offer does not create second purchase

refresh keeps legitimate access

G. Payment Security

modify frontend amount cannot change order amount

fake payment=paid query cannot unlock

Gift order cannot unlock Offer

payment_started retry reuses payment link

paid order cannot restart

repeated callback does not downgrade paid

callback redirects using DB Experience ID

provider transaction ID preserved

H. Creator Financial Screens

earnings loads

Gift/Offer split correct

historical orders still present

current share UI clearly provisional if still shown

payout not falsely shown active

finance ledger only after proper integration

I. Moderation

participant report submits

duplicate same-participant report handled

admin sees report

admin moderation pause

participant sees generic unavailable

creator cannot reopen moderation pause

admin release

creator can then republish

audit exists

J. Analytics

existing view/start not broken

result_viewed

offer_viewed

checkout start

gift selection

share event

purchase events only from verified server-side paid order

repeat Gift analytics semantics confirmed

K. Security

security audit SQL reviewed

RLS enabled

no service role in frontend

no payment secret in frontend

no OpenAI key in frontend

Google secret rotated

logs sanitized

file upload JPG/PNG only

external URLs validated

admin unauthorized access tested

L. Final

Record:

production commit:

deployment timestamp:

domain:

Supabase project:

payment mode:

tester:

known issues:

Decision:

GO

NO-GO