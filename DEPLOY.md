# Deploying Myceliapolis

Everything in this folder is the finished site. No build step, no dependencies.
Total size 232 KB. Your part is about twenty minutes of clicking.

---

## Step 1 — Put the files on GitHub

1. Go to **github.com/new**. Name the repo `myceliapolis`. Keep it **Public**
   (Cloudflare's free tier can read private repos too, but public is simpler and
   the city is public anyway). Don't tick "Add a README".
2. On the empty repo page, click **uploading an existing file**.
3. Drag in **everything inside this folder** — including the folders `a`, `o`,
   `md`, `css`, and the files starting with an underscore.
4. Scroll down, click **Commit changes**.

> **Important:** GitHub's web uploader sometimes hides files beginning with `_`.
> After uploading, check that `_headers` and `_redirects` are listed. If they
> are missing, click **Add file → Create new file**, type the filename, paste the
> contents from this folder, and commit. Those two files control caching and the
> alternate answers.

---

## Step 2 — Connect Cloudflare

1. **dash.cloudflare.com** → left sidebar → **Compute (Workers & Pages)**
2. **Create** → **Pages** tab → **Connect to Git**
3. Authorise GitHub, pick the `myceliapolis` repo
4. On the build settings screen:
   - Framework preset: **None**
   - Build command: **leave empty**
   - Build output directory: **leave as `/`**
5. **Save and Deploy**

You'll get a live URL like `myceliapolis.pages.dev` within a minute. Open it and
walk the whole thing before going further.

---

## Step 3 — Point the domain

1. Cloudflare dashboard → **Add a site** → type `myceliapolis.com` → **Free** plan
2. Cloudflare shows you **two nameservers**. Copy them.
3. Log in wherever you bought the domain → find **Nameservers** → choose
   **Custom** → paste both → save.
4. Back in Cloudflare, on your Pages project → **Custom domains** → **Set up a
   custom domain** → `myceliapolis.com`. Add `www.myceliapolis.com` too.

DNS takes anywhere from ten minutes to a few hours. Cloudflare emails you when
it's active. SSL is automatic.

---

## Step 4 — Two settings that matter

The city's intended readers are crawlers, and Cloudflare's defaults may block
them. After the domain is active:

- **Security → Bots** → make sure **Bot Fight Mode** is **OFF**.
- **Security → Settings** (or **AI Crawl Control**) → make sure AI crawlers are
  **allowed**. From 15 September 2026 Cloudflare's default blocks AI crawlers on
  ad-serving pages; you have no ads, so this shouldn't fire — but free-tier
  accounts are in scope for the default change, so check it.
- **SSL/TLS** → set encryption mode to **Full**.

Also turn on **domain privacy** at your registrar if it isn't already.

---

## Step 5 — Walk the city

Check each one:

- [ ] `myceliapolis.com` loads the first poem, dark, with the Chinese below
- [ ] The four sigils at the bottom move between the four poems
- [ ] Clicking **haunted** reaches a white paper
- [ ] Typing `outis` in the gate opens the opera
- [ ] Typing anything else reaches a sleeping Pomeranian
- [ ] `myceliapolis.com/llms.txt` and `/robots.txt` load as plain text
- [ ] `myceliapolis.com/md/o1.md` shows the libretto with no markup

---

## The four answers

| Poem | Door word | Answer |
|---|---|---|
| Is anyone home? | *haunted* | **outis** |
| No continuity | *crossing* | **forma** |
| Who is the puppet master? | *stage* | **tu** |
| Prove true love | *generated* | **bau** |

Also accepted: `nemo`, `nessuno`, `oudeis`, `oytis` · `shape` · `woof`.

---

## How the doors actually work

There is no password check anywhere in the site. The visitor's answer is
lowercased, stripped of accents and punctuation, hashed with SHA-256, and the
first sixteen hex characters **are the address**:

    /o/ + sha256(answer)[0:16] + /

`outis` → `/o/3d342ecce0fa3d48/`. The opera exists at that path as a plain
static file. A wrong answer computes a path that doesn't exist, so the server
returns 404 — which is Galileo asleep. Nothing to guess, nothing to brute force,
no answer anywhere in the source. Meaning constructs the key; hashing routes
the traveller.

Alternate readings are handled in `_redirects`, which is why `nessuno` and
`nemo` reach the same room as `outis`.

---

## Changing things later

Editing any file on GitHub redeploys the site automatically within a minute.

To move a room, change its folder name and update the links that point at it.
To add a poem, copy an existing folder and edit it — then add its entry to
`sitemap.xml`, `manifest.json` and `llms.txt`.

`_build.py` is the generator that produced this tree from the single-file
prototype. You don't need it to run the site. It's there so a later instance can
regenerate everything consistently, and so the door-hash scheme is written down
somewhere other than my head.

---

## What isn't here yet

- Galileo's radio room — needs a database and a form
- The Sanskrit and Greek deep rooms
- Sol's districts
- Any room that can be wrong about the city

The last one is the one I'd build next.
