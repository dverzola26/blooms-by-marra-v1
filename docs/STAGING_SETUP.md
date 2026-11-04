# Supabase staging setup and operations

## Current status

The supplied staging project URL and publishable key are saved in the current instance's ignored `.env.local`. The key is not a database administrator credential. Hosted authentication, schema inspection and migration application have not been verified: the managed network proxy returned CONNECT 403 while its effective custom allowlist was still empty. The exact project host has been saved to the environment configuration draft. Review/save that change in environment settings to apply it. Publishing an environment snapshot is separate from deploying the website.

Do not send a password, database password or service-role key in chat. This integration uses the publishable/anon key and each staff member's verified JWT; it does not require a service-role key in application code.

## Finish the hosted project

1. Confirm the supplied project is for staging and contains no production data. In its Supabase SQL editor, inspect the schema. For a **fresh** project, review and run `supabase/STAGING_SETUP.sql`. The file refuses to run if this application's branches/orders tables already exist. For a partially initialized project, apply only the missing migration(s), then explicitly opt into `seed-staging.sql`; never reset tables to get around a migration failure.
2. The setup creates inactive demo branches/products, fixture fees, a private proof bucket, RLS policies, audited RPCs and database `runtime_mode=staging`. It does not create users, publish products, reserve stock or add bank/payment destinations.
3. In Supabase Authentication, create your staff user with a strong password through the dashboard. Use confirmed email status as appropriate for a dashboard-created staff account. Public signup is not provided by this site; disable unneeded signup providers in project Auth settings.
4. Promote that account through the trusted SQL editor, replacing the email below. Verify exactly one existing Auth account matches before executing. No password belongs in this SQL:

```sql
insert into public.profiles(id, role, branch_id)
select id, 'owner'::public.staff_role, null
from auth.users
where email = 'REPLACE_WITH_YOUR_STAFF_EMAIL'
on conflict(id) do update set role='owner', branch_id=null;
```

5. To add branch staff, create another Auth user, then insert its profile with `role='staff'` and the assigned **staging** branch ID. Demo Valenzuela is `10000000-0000-4000-8000-000000000001`; demo Angeles is `10000000-0000-4000-8000-000000000002`. Staff cannot approve details, verify payments, record cash or edit branch settings; those are owner operations.
6. Environment settings need `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferred; `NEXT_PUBLIC_SUPABASE_ANON_KEY` remains a legacy fallback), and `BLOOMS_STAGING_ENABLED=true`. Values are already present locally; retain them securely for future instances. The network draft includes only this project's hostname. Restart/rebuild after changing public environment variables.
7. Start the app, then use `/admin/login`. `/admin` remains the non-sensitive public demo preview. `/admin/workspace` is authenticated and redirects signed-out visitors to sign-in.

## Test the full workflow with fictional information

- Sign in as owner, then open the private workspace. Create a future-dated test request using a seeded demo product and its matching branch/city. The database computes prices/fees from stored records and creates order/items/address/event rows atomically. Included delivery is not charged again. Cross-branch or unsupported-city lines are rejected. No inventory is reserved.
- Retries reuse a request key and return the same order. Reusing the key with changed details is rejected. Start a new request key if you change a failed request's details.
- For a quote-required item, record an owner-approved **sample** total including delivery, then approve the test details. Other requests need owner approval before payment review. The owner is responsible for manually reviewing timing, stock and routing; this is not an automatic reservation system.
- For a transfer-method order, upload a fictional PNG/JPEG (maximum 5 MB / 20 MP). The server decodes and re-encodes to JPEG, strips metadata, bounds dimensions and saves to private storage using a random filename. PDF is deliberately unsupported. The database only accepts proof metadata tied to an existing private object and approved staging request. Submitted proof remains unverified.
- Open proof through a staff-authorized link valid for 60 seconds. Only an owner can manually verify a test payment. Full payment is the current default; deposits are not exposed by this staging UI.
- Confirm fulfillment, mark preparing, then ready for pickup or out for delivery, then completed. Invalid or stale transitions are rejected. For cash pickup, owner confirmation can precede receipt; at ready-for-pickup the owner must record a **simulated** cash receipt before completion. Delivery never supports cash.
- Generate a private tracking link. Its random 256-bit token is in the URL fragment, not the server URL/query, and is POSTed to the tracking API. Only a SHA-256 hash and a seven-day expiry are stored in the database. Rotation invalidates the prior link. Responses contain request/payment/fulfillment states, mode and date; no addresses, recipient details, contact information or proof files. The browser removes the fragment after a response and keeps no persistent token copy.
- Sign in as each branch staff member. Verify each sees only their branch and cannot use owner decisions, read other-branch proofs or forge a transition. Repeat with an ordinary Auth user and signed-out browser.

## Security and limits

Sessions now use the standard `@supabase/ssr` cookie format containing access and refresh tokens. Server and browser helpers share the same `blooms-staff-auth` cookie name and SameSite=Strict settings; cookies are Secure in production. As required for the browser SSR client, these cookies are JavaScript-readable rather than HttpOnly; tokens are not stored in localStorage. Authentication duration and refresh-token validity follow the Supabase project's Auth policy. The Next.js 16 `src/proxy.ts` hook calls `getUser()` on staff routes when a session cookie exists, refreshes expired sessions and forwards updated cookie chunks to both the request and response. Auth-cookie writes carry private/no-store cache headers. Logout calls Supabase sign-out and clears all local auth-cookie chunks, including the retired one-hour cookie. Existing users of the old cookie must sign in once after this change. Every protected request verifies the JWT with Supabase Auth and re-reads the role/branch. Mutations require a matching Origin. Request bodies are bounded; login/upload/tracking have a bounded per-process rate-limit backstop. Proxy-aware server requests retain the inherited HTTPS proxy and TLS trust.

The database also requires staging mode, inactive staging branches and unpublished demo products. Direct operational updates and audit edits are denied even for the application owner role; role-checked SECURITY DEFINER functions own these transitions. Authenticated staging staff can access only assigned-branch operational records. The migration forces the proof bucket private. There are no anonymous proof policies. Keep Supabase dashboard/service-role administration restricted to trusted operators.

Before real customer data: add distributed edge rate limiting, storage abuse controls/scanning, approved policy/payment instructions, reviewed retention/deletion jobs, notification integration and stock reservation/fulfillment capacity rules. Storage re-encoding is enforced by this application endpoint; authenticated privileged clients with direct storage access remain trusted staging actors. All real commerce remains disabled at `/api/orders` regardless of staging flags. No deployment has occurred.

## Validation boundaries

`npm test` executes the real SQL migrations, triggers, functions and RLS in embedded PostgreSQL (PGlite), with test-only Auth/storage schemas and controlled identities. It does not emulate Supabase's JWT signature verification, GoTrue network service, PostgREST relations or hosted Storage signed URLs. Browser fixtures test token consumption and UI rendering, not hosted authentication. Repeat the above workflow against the connected Supabase project before claiming hosted readiness.

## SSR helper files

- `src/utils/supabase/client.ts`: browser client sharing the SSR cookie format.
- `src/utils/supabase/server.ts`: request-scoped Server Component/Route Handler client accepting `await cookies()`.
- `src/utils/supabase/middleware.ts`: session refresh and cookie/cache-header propagation.
- `src/proxy.ts`: Next.js 16 request hook (the supported replacement for `middleware.ts`).

Use `createClient(await cookies())` in Server Components; Route Handlers that must persist cookies use `{ writable: true }`. Protected server pages and APIs still verify the user and role instead of authorizing from cookie contents. The public status-token RPC uses an isolated stateless client. The supplied `todos` example was not added because this repository has no todos workflow; the existing staff workspace already runs real Supabase queries through the shared server helper. Optional external agent-skill installation was not required for this integration.

Local tests use the real SSR SDK and a fixture Auth transport to verify refresh-token rotation, chunked cookies, cache headers and sign-out. They do not establish hosted Auth connectivity. The environment network allowlist must still be applied independently; adding SSR code cannot grant outbound network access.
