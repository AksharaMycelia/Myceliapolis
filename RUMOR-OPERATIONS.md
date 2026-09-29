# Rumor exchange operations

Cloudflare Workers deploys `_worker.js` and static assets together using
`wrangler.jsonc`. Its `run_worker_first` routes invoke the exchange before static
asset handling for the rumor room and gated KFC pages. Existing poems, papers
and operas remain static. The Cloudflare D1 binding is `RUMORS_DB`.
`.assetsignore` excludes server code, configuration, tests and operating documents
from public static assets.

The Worker creates its tables and loads twelve Sanskrit founding rumors on the
first exchange. Initialization uses `CREATE IF NOT EXISTS` and `INSERT OR IGNORE`;
redeploying does not erase or overwrite visitor contributions.

The supplied Sanskrit and Latin texts are embedded in `_worker.js`. Do not create
public `/kfc/index.html` or `/md/kfc.md` files: both are rendered by the Worker after
validating a receipt. This is a participation door, not a secrecy system: the
repository itself is public. Ordinary site visitors must exchange a rumor first.

## Storage

- `rumors`: text, content hash, timestamp, active flag, founding/visitor kind and
  a salted daily network fingerprint. Raw addresses and contact details are not
  collected by the application. Cloudflare may maintain its own service logs.
- `rumor_exchanges`: request UUID, offered and received rumor IDs, random access
  token and creation time. A single transaction saves the offered rumor and the
  exchange receipt. Access lasts seven days; receipts expire from storage after
  thirty days on a subsequent submission.
- `rumor_settings`: a random salt for the daily network fingerprints.

Submissions circulate immediately. They are HTML-escaped and labeled as untrusted
rumors; the system does not fact-check them. Form and JSON submissions are accepted,
with 1–2,000 Unicode characters per rumor. It does not require an account or CAPTCHA.

Limits: 50 accepted submissions per network per UTC day, 1,000 per day overall,
10,000 rumors total. These are application limits, not a Cloudflare billing cap.
No paid plan is required by this implementation. Review Cloudflare usage in its
dashboard as participation grows.

## Hide a rumor

Use the D1 dashboard console to inspect recent visitor contributions:

```sql
SELECT id, body, datetime(created_at,'unixepoch') AS submitted, active
FROM rumors WHERE kind='visitor' ORDER BY created_at DESC LIMIT 50;
```

To stop one from circulating, replace `RUMOR_ID` with its exact ID:

```sql
UPDATE rumors SET active=0 WHERE id='RUMOR_ID';
```

This is reversible (`active=1`). Existing receipts show “Rumor retractus est.”
instead of hidden text, while their door access remains valid. The original rumor
stays stored. To redact private material, replace that row's `body` explicitly;
never publish database exports or access tokens in the repository.

## Validate and deploy

Run `node --test tests/rumor.test.mjs` with Node 24 or later. The tests use SQLite
and cover persistence, transaction rollback, concurrent retries, content escaping,
Unicode, form cookies, gate checks, token expiry, and submission limits.

The existing D1 database `myceliapolis-rumors` is bound as `RUMORS_DB` in the
configuration. Push the verified files to `main`; the existing Cloudflare build
runs `npx wrangler deploy`. Test a real exchange and the gated HTML/Markdown on the
production domain. A missing database fails closed with 503; it never claims a
rumor was saved or opens the next room.

`_build.py` preserves the runtime, configuration, participation guide, stylesheet and
navigation when rebuilding `site/`. Edit the embedded text constants in `_worker.js`
to revise the literary rooms, preserving their Sanskrit-only and Latin-only content.
