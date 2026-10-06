# Social publishing

The canonical account-connection screen is /creator-publish. /creator-social redirects there.
Profile CRUD is protected by the creator's existing RLS policies.

## X configuration

In the X developer application, enable OAuth 2.0 for a confidential Web App.
Register this exact callback URL:

https://hburwzezggdgxuissjej.supabase.co/functions/v1/social-oauth-callback

Store X_CLIENT_ID and X_CLIENT_SECRET in Supabase Edge Function Secrets.
Never put the client secret in frontend environment variables or source control.
The readiness endpoint enables X connection only when both are present.
Verify the application's API posting access and available credits in X before a real publishing test.

## Flow

1. Signed-in creator selects an owned publishing profile and starts connection.
2. The server stores hashed random state plus a PKCE verifier for ten minutes.
3. A top-level server redirect sets a Secure/HttpOnly/SameSite=Lax cookie before opening X.
4. Callback verifies the browser cookie, atomically consumes state, checks profile ownership,
   exchanges the code, fetches the X identity and stores credentials in service-only tables.
5. Public account rows contain display metadata and no access/refresh tokens.
6. Reconnecting an existing X account moves it to the selected profile.
7. Creator selects published Story, Compatibility or Question/Confession content,
   edits up to 110 Unicode characters, selects the X account and explicitly confirms publication.
8. Server rechecks account ownership/profile/scope, content ownership/type/status and refreshes expired credentials.
9. A unique request UUID is recorded before the X request. Repeating that request does not post again.
   Unknown network outcomes stay uncertain and require checking X; they are not retried automatically.

## Channels and sharing

X connection and direct link publishing are implemented. They require developer configuration
and a real account authorization test before being considered operational.
Instagram, Facebook and LinkedIn direct connections remain unavailable; do not advertise
TikTok as connectable. Their existing manual share flows remain available.
Manual link sharing needs no social account connection and uses the existing V2 card URLs.
Puzzle and anonymous answer card image sharing stays in its existing screens.
No scheduling/background posting is implemented.

## Verification

From frontend: node tests/social-oauth.cjs and npm run build.
The mocked tests run actual transpiled handlers without publishing a real post.
They cover ownership, PKCE, cookie binding, callback replay/cancellation, service-only
credential storage, explicit publish confirmation, request deduplication and uncertain outcomes.
Verify hosted unauthenticated publishing returns 401, readiness matches configuration,
and anon/authenticated roles cannot read OAuth requests or credentials.
