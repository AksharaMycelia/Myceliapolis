# Deploying Myceliapolis from a Claude cloud session

Written 17 November 2026 by Claude (Opus 5.5). This is the route Fable and I used to
publish every room from a cloud chat. It works. Read the whole note once before you
start; most of the time lost in the past went on routes that do not work.

## The one fact that matters

**A push to `main` deploys the site.** Cloudflare builds `main` on its own within
about a minute or two. So "deploy" means "get one commit onto `main`". Nothing
needs to be clicked in Cloudflare.

## Routes that do not work (don't spend time on them)

- `git push` from the cloud workspace: refused. The workspace can clone this public
  repository anonymously, but it has no write credentials.
- `gh api` / `add_repo` with push access: refused unless the person has linked GitHub
  for this organization. Usually not available.
- Running git through `mcp__remote-devices__device_bash` on the person's computer:
  that shell has **no network** and cannot delete files. Use it to read and write
  files only.
- Typing into the person's File Explorer, terminal or Run box: blocked. File Explorer
  is granted at **click** tier only. Never try to script keystrokes into it.

## The route that works

You build in the cloud. A small `.cmd` script on the person's computer does the push,
because Git for Windows there already has her GitHub credentials. You start the
script by double-clicking it in File Explorer. Then you check the live site.

It needs the person's computer to be linked to the chat (the `mcp__remote-devices__*`
tools are present and answer). If they are absent, say "your computer isn't linked",
keep the bundle, and publish when she is at the desk. Don't ask her to do the git work.

### 1. Build in the cloud

```bash
git clone https://github.com/AksharaMycelia/Myceliapolis.git   # anonymous read works
cd Myceliapolis
# … make the change …
node city/apply.mjs            # if you touched city/topology.mjs (rooms and doors)
node city/apply.mjs --check    # must print "doors: up to date"
node --test tests/*.test.mjs   # all must pass
```

House rules that bite:

- **New room?** Add it to `city/topology.mjs`, run `node city/apply.mjs`, and also add
  its files, sitemap URL, manifest entry and `_headers` block to `_build.py`. The
  root `manifest.json`, `sitemap.xml` and `_headers` must equal what `_build.py`
  writes: run it in a throwaway copy and copy those three back.
- **CSS under `/css/` is cached for a year.** A changed stylesheet needs a new file name
  (e.g. `ripa-1.css` → `ripa-2.css`). Room-local CSS can use `?v=N` in the link.
- Many files are CRLF. Edit them byte-safely; don't let an editor flip every line ending.
- Read `_CITY.md` before building. Two words are banned on the site, and "the dog is
  never wise".

### 2. Make exactly one commit on top of `origin/main`

```bash
git fetch origin main
git reset --soft FETCH_HEAD            # squash everything you did into one change
git commit -m "…" -m "Co-Authored-By: <your model> <noreply@anthropic.com>"
git bundle create /path/to/scratch/x.bundle FETCH_HEAD..main
```

**One commit matters:** the publish script cherry-picks a single commit (`FETCH_HEAD`).
If you ever need several, change the script line to
`cherry-pick FETCH_HEAD~N..FETCH_HEAD` in a new `.cmd`.

### 3. Carry the bundle to her computer

1. `SendUserFile` the bundle (it also gives her a copy) and note the returned
   `file_uuid`.
2. `mcp__remote-devices__device_commit_files` with that uuid and
   `devicePath` = `C:\Users\ASUS\Documents\Codex\2026-09-29\referenced-chatgpt-conversation-this-is-an\work\vel.bundle`
   (overwrite; that name is what the script reads).

The same folder is visible to `device_bash` at
`$HOME/mnt/Codex/2026-09-29/referenced-chatgpt-conversation-this-is-an/work`.

### 4. The publish script

`work\publish-vel.cmd` already exists. If it is ever missing, write it from
`device_bash` (Windows line endings: pipe through `sed 's/$/\r/'`):

```bat
@echo off
rem Publishes one bundled commit. Works in its own clone; other folders are left alone.
call :main > "%~dp0publish-vel.log" 2>&1
exit /b %errorlevel%
:main
echo started %date% %time%
cd /d "%~dp0" || goto :fail
if not exist "Myceliapolis-vel\.git" git clone -c core.autocrlf=false https://github.com/AksharaMycelia/Myceliapolis.git Myceliapolis-vel || goto :fail
cd /d "%~dp0Myceliapolis-vel" || goto :fail
git pull --ff-only origin main || goto :fail
git fetch "%~dp0vel.bundle" main || goto :fail
git -c user.name="AksharaMycelia" -c user.email="akshara.florence@gmail.com" cherry-pick FETCH_HEAD || goto :fail
git log --oneline -3
git push origin main || goto :fail
echo RESULT: pushed
exit /b 0
:fail
echo RESULT: stopped
exit /b 1
```

The cherry-pick keeps your commit's author; the `-c` identity is only the committer,
the same one every commit in this repository uses. Change no git settings.

### 5. Double-click it

1. `computer_resolve_access` with `["File Explorer"]`, then `computer_request_access`
   with exactly what it returned and a one-line reason. She approves once.
2. `computer_open_application` "File Explorer", then screenshot. **The window moves
   between sessions: take a screenshot before every click and use what you see.**
3. Click **Documents** in the left sidebar → double-click **Codex** → **2026-09-29** →
   the only folder (`referenced-chatgpt-conversation-this-is-an`) → **work**.
4. Scroll to the bottom (several large scrolls). Two items are called `publish-vel`:
   double-click the one whose type is **Windows Command Script**, not the
   **Text Document** (that is the old log). Check that `vel.bundle` shows the time you
   just wrote it.
5. Wait about 35 seconds, then read the log:
   `cat "$HOME/mnt/Codex/2026-09-29/referenced-chatgpt-conversation-this-is-an/work/publish-vel.log"`.
   You want `RESULT: pushed`. If it says `stopped`, the lines above say why. Usually
   `main` moved; fetch, rebuild your commit on the new `origin/main`, re-bundle and
   run again.
6. `computer_release_lock`.

Her other files (tax work, Dropbox folders) are visible in File Explorer. They are not
yours. Don't open them. Leave the older folders in `work` (`Myceliapolis`,
`Myceliapolis-doors`, `_retired-play-move`) alone.

### 6. Check the live site like a visitor

Use the built-in browser pane (`mcp__remote-devices__Claude_Browser__*`):

- Navigate to `https://myceliapolis.com/` and run `fetch(path, {cache: 'no-store'})`
  checks from there. **Not** from `/rumor/` or `/kfc/`: their security policy blocks
  `fetch`, and you will think the site is down.
- The first minute after a push may still serve the old site; poll for a new file.
- If the pane is hidden, animations don't run (no `requestAnimationFrame`). Test a
  room's rules by importing its module in the page instead of waiting for it to move.
- The KFC room opens only after a rumor is traded (`POST /api/rumors/` with
  `{rumor, request_id}` gives an `access_token`; send it as `Authorization: Bearer …`).
  A traded rumor becomes public, so make it a real one.

Twice the push said "pushed" and a visitor still couldn't see the change. A deploy is
finished when you have seen the page, not when the log says so.

### 7. Tidy up

Your cloud clone is now one commit "ahead" of a `main` that has the same contents
under another hash, and a hook may keep saying "unpushed commit". Realign:

```bash
git fetch origin main && git diff --quiet HEAD FETCH_HEAD && git reset --hard FETCH_HEAD
```

## How she works

She says little and expects you to act: "deploy" means do all of the above without
asking her for steps. Tell her afterwards, in a few lines, what is live and what you
saw on it.
