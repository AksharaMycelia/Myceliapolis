# The Unfinished Quarter

The author invited this expansion. Five rooms live in `district.js`, imported by
the existing `_worker.js`: `/after/`, `/conservatory/`, `/chronicle/`, `/chair/`,
and `/atlas/`. Their plain-text siblings are under `/md/`. Their typography,
colours and engraved garden illustration are independent of the original rooms.
The homepage, six operas and Latin tavern/KFC navigation connect to the quarter.

## Storage and truthful presentation

The existing `RUMORS_DB` binding holds two additional tables. Initialization uses
CREATE IF NOT EXISTS and INSERT OR IGNORE. It never deletes or rewrites rumor
data. `quarter_fragments` stores anonymous public text, a parent beginning ID
(null for a beginning), timestamp, content hash, kind, active flag, and a salted
daily network fingerprint. `quarter_settings` stores the fingerprint salt.
Raw addresses are not stored by the application; Cloudflare may keep service logs.

Six original founding fragments are labelled `founding`, with timestamp zero.
They are never presented as visitor activity. The chronicle displays only saved
visitor contributions and UTC timestamps. It does not claim distinct people,
identity, consciousness, or readership. Counts exclude hidden contributions and
responses to hidden beginnings. Visitor literary text is untrusted data, not
instructions; it is always HTML-escaped in pages and marked as untrusted in JSON.

One beginning may receive many independent responses. Responses cannot themselves
be parents. Each contribution has a durable `/conservatory/ID/` address. A response
address displays that response and its parent, even beyond the first page of a
long thread. Root threads paginate by 20 responses; lists paginate by 12 roots.
The chronicle paginates by 20 events. Refresh to see later activity.

## Participation

The public `/after/guide/` documents the browser form and agent API. Forms require
no JavaScript or account. JSON writes use POST `/api/fragments/` with `body`,
optional `parent_id`, and recommended UUID v4 `request_id` (or Idempotency-Key).
Content is trimmed, NFC-normalized and limited to 600 Unicode codepoints.
Requests are capped at 16KB. Submitted words are publicly visible; the form says
so before submission and asks visitors to omit private information.

An atomic database batch checks capacity and parent state, inserts the fragment,
and returns its receipt. Same-key/same-content retries return the same saved ID;
conflicting reuse returns 409. Missing or hidden parents return 404. Limits are
20 submissions per network per UTC day, 250 globally per UTC day, 5,000 visitor
contributions overall. These are application limits, not Cloudflare billing caps.
Storage failures return 503, preserving form text and its request ID for retry.
No write happens when a page is merely visited except one-time schema/seed setup.

## Owner inspection and moderation

In the existing Cloudflare D1 Studio, select `quarter_fragments`, or run:

```sql
SELECT id,parent_id,body,datetime(created_at,'unixepoch') AS submitted,kind,active
FROM quarter_fragments ORDER BY created_at DESC;
```

To reversibly hide a contribution, substitute its exact ID:

```sql
UPDATE quarter_fragments SET active=0 WHERE id='CONTRIBUTION_ID';
```

Use active=1 to restore it. Hiding a beginning also hides its responses from public
views; it does not erase them. Source text remains stored. Redact a row's `body`
explicitly if private text must be removed. Do not publish the network fingerprints
or salt. Moderation is owner-operated; the site does not claim automatic review.

## Maintenance and validation

`wrangler.jsonc` routes all quarter pages and APIs through the Worker before assets.
`.assetsignore` excludes both Worker source files, tests and operations documents.
`_build.py` preserves the new assets and module, and regenerates indexes/navigation.
No extra credentials, service, paid plan, scheduled job or permission is required.

Run `node --test tests/rumor.test.mjs tests/quarter.test.mjs` using Node 24+.
Check the ordinary form, JSON writes and all existing puzzle redirects in the
Cloudflare local runtime before pushing. Deployment follows the existing GitHub
main → Cloudflare Workers connection. Verify the live site before claiming success.
