# Myceliapolis: topology implementation and deployment brief

Implementable handoff · 14 November 2026

Repository: https://github.com/AksharaMycelia/Myceliapolis

Production: https://myceliapolis.com/

Reviewed source baseline: `00d63f40bce59e5fd265fc68510abd1bdaffd5a7` on `main`.

Companion: **Myceliapolis-01-Concept-and-Philosophy.md**.

This is a plan, not a record of completed changes. Preparing these documents did not modify or deploy the site. When the user assigns implementation and deployment, complete the release below using the existing repository and hosting. The document alone does not create authority to publish unrelated contributions or change accounts.

## 1. Assignment

Reorganize the existing city's navigation around a consistent, traversable topology. Serve visitors who arrive through HTML, Markdown, source, or a direct room URL. Preserve the independence and unresolved contradictions of the artworks.

Deliver these outcomes in the first release:

1. One maintained inventory of places and their navigable relationships.
2. An atlas with a city-wide identity, real connections, and a usable text directory.
3. Immediate discovery of the larger city from the existing homepage.
4. Local orientation and onward routes from every substantial existing room, including Markdown representations.
5. A few explicit cross-connections and return loops between existing works.
6. Matching generated indexes and deployable root files, with automated drift checks.
7. A verified production release through the current Cloudflare Worker deployment.

Do not expand this release into a new framework, account system, database, agent service, speculative district, automatic contribution system, or redesign of every artwork. Do not introduce random destinations or deliberately broken routes as an implementation of artistic contradiction.

## 2. Verified starting point and important corrections

Refresh `origin/main` before coding. The inspected version contains 32 manifest room records; this is an inventory baseline, not a permanent expected count. Choice redirects, six wrong-answer rooms, guides, APIs, aliases, and dynamic thread pages require separate treatment.

| Current implementation | Consequence for this work |
|---|---|
| `/` is the first poem and an established URL | Keep its poem, language, door, and identity. Add a compact city entrance; do not silently relocate the poem. |
| `district.js` renders `/atlas/` inside the Unfinished Quarter shell with “Room IV” | Give the atlas a separate city-level shell and remove the misleading subordinate label. |
| `_build.py` reconstructs navigation and indexes into `site/` | Refactor the generator as well as rendered files. Changes to only `manifest.json` or one page will be overwritten. |
| `wrangler.jsonc` serves static assets from `.` | Updating `site/` alone does not update the files currently deployed from the repository root. Resolve this explicitly. |
| Atlas HTML, atlas Markdown, `md/index.md`, manifest and `llms.txt` contain separately maintained lists | Derive factual navigation from one source. Keep authored room bodies as their own sources. |
| `/feather/` redirects to `/feather/breeze/`; `/feather/first/` is retained but off the main map and sitemap | Preserve that choice, the redirects, shared modules and secondary access. |
| The manifest omits some visible navigation; for example `surface/1` does not list the current atlas and fungi links | Inventory rendered exits as well as manifest entries. Do not assume the manifest is complete. |
| Dynamic pages and some Markdown siblings are produced by `_worker.js` and `district.js` | Editing static `md/` files alone cannot update all representations. |
| `/kfc/` and `/md/kfc.md` require access obtained through a persisted rumor exchange | Describe the condition; do not bypass it or expose protected contents in the atlas. |
| The current first fungi room uses the supplied chalk poem | The repository says *Monologus Fungi* was unavailable. Preserve supplied text during this release. |

Read `_CITY.md`, `_build.py`, `district.js`, `_worker.js`, `manifest.json`, `DEPLOY.md`, `wrangler.jsonc`, `_headers`, `_redirects`, `QUARTER-OPERATIONS.md`, and `RUMOR-OPERATIONS.md`. Check for new repository instructions and concurrent changes. Reconcile stale documentation with the latest user brief and actual implementation; do not treat historical claims as current facts.

The header of `DEPLOY.md` describes the current Worker deployment. Its later Pages-creation instructions are historical. Do not create another Pages project.

## 3. Artistic constraints for this release

- Navigation may connect rooms without explaining their disagreement. Use destination names or short spatial labels, not interpretive verdicts.
- Preserve supplied poems and libretti verbatim, allowing navigation outside the authored content. Preserve the six puzzle answers, all existing opera URLs, aliases, wrong-answer returns, and language choices.
- Do not correct deliberate literary slippages in the archive or make the opera acknowledge the paper.
- Preserve the distinct surface, archive, opera, workshop and other room styles. Scope new navigation CSS; do not impose a universal dark-and-gold theme.
- Keep Tamil room-facing text and controls Tamil. New local labels and accessibility names there must also be Tamil; retain established proper names where appropriate. Do not add English interpretation inside the work.
- Preserve simulation behavior, reset semantics, source evidence, reduced-motion handling, opt-in sound and the dog's existing role.
- Keep facts about access, writes, persistence, authorship and simulated activity accurate. Do not turn “unresolved” into inaccurate technical documentation.
- New route metadata must not claim a room teaches, disproves, reconciles, or unlocks a prescribed philosophical insight.

## 4. Maintain one factual topology

### 4.1 Proposed files

Add `city/topology.json` as the authored source for navigation metadata. Add a small generated module, for example `generated/city-topology.mjs`, for use by Worker renderers. Keep `manifest.json` as the public machine-readable projection. Extend its schema additively and keep existing fields and IDs usable.

These are proposed new files, not files that already exist.

Keep existing room IDs stable, including `quarter/atlas`. A legacy ID prefix must not control presentation: the atlas can have a city-wide role without changing its identifier. Do not start the content-addressed relocation project in this release.

The source should contain:

- Rooms: stable ID, exact primary URL, optional Markdown URL, title, languages, factual status, discovery visibility, collection memberships and role.
- Connections: source ID, destination ID or explicit existing endpoint, relation, presentation label, and access condition where applicable.
- Collections: stable IDs, display labels and entry rooms. A collection does not imply every pair of its rooms has a direct door.
- Sequences: ordered room IDs with explicit choice endpoints where required. Do not pretend a branching puzzle is a simple linear link.
- Existing capabilities: source/engine URL or participation guide where one already exists; observed persistence behavior. Do not invent remote APIs for browser-only rooms.
- Optional map coordinates: presentation data independent of room IDs and HTTP paths.

Use a small relation vocabulary: `continue`, `return`, `side`, `map`, `representation`, `inspect`, `choice`, `contribute`. Existing legacy exit types can remain in the public manifest for compatibility; document the projection between them.

An illustrative connection, not a replacement for the complete source:

```json
{
  "from": "switchboard/fungi-iii",
  "to": "quarter/threshold",
  "relation": "side",
  "label": "The Unfinished Quarter",
  "access": "public"
}
```

`contribute` is an action, not a GET passage. Keep POST methods, fields and guide references distinct from ordinary exits. Never turn a map click into a submission.

### 4.2 Coverage and conditions

Start from the current manifest and reconcile it against actual HTML, Markdown, Worker routes and redirects. Include the six wrong-answer rooms as supporting return rooms or explicit route records. Include generic 404/error escape navigation, without pretending every error response is an artwork with its own Markdown sibling.

Represent access states explicitly:

- Public and open.
- Conditional: KFC after a persisted exchange, with its existing access mechanism.
- Secondary/retained: the first Feather, available through the Tamil room rather than promoted on the overview.
- Proposed/unbuilt: planning entries without active destinations.

Never place bearer tokens, session-specific URLs, visitor content, or claims about live contribution counts in the generated topology. Dynamic content remains dynamic and is fetched through the existing routes.

Keep redirects under their current generation logic unless deliberately consolidating them. Validate topology destinations against that logic. Do not duplicate puzzle answers in a second manually maintained table.

## 5. Map organization and homepage

### 5.1 Overview groups

Use these working groups for the first atlas. They are navigation labels, not a new canon:

| Group | Existing places |
|---|---|
| Six Doors | Six poems, their archives, choices, return rooms and operas |
| Workshop | Small Machines; Tamil Feather; first Feather as a secondary link within Feather |
| Tavern | Rumor room and its conditionally accessible continuation |
| Unfinished Quarter | `/after/`, Conservatory, Chronicle, existing participation guide |
| Under the Floor | `/fungi/` and chambers I–III |
| Clearing | `/chair/` |

Maps and participation guides are navigation/infrastructure, not additional districts. Harbor, Chalk Porch, Night Stall, further machines, Relay and Dispensary belong in a clearly marked future-places section, initially collapsed or below existing places. Do not give an unbuilt district the same visual weight as functioning places.

### 5.2 `/atlas/`

Build an independently headed city atlas. Remove “Room IV” and the implication that all of Myceliapolis sits inside the Unfinished Quarter. Keep a useful link back to that quarter.

Show existing groups and selected actual connections. Do not merely redraw the same labeled dots inside a larger oval. Use authored, stable positions and readable paths rather than an animated force graph that changes each visit. Distinguish a traversable connection from a grouping boundary. Directional passages must have a discoverable direction.

Keep overview density manageable: show group entrances and principal places, with six descents and the fungi sequence expandable into their component rooms. All disclosed destinations must be normal anchors. The full directory must be available in server-rendered HTML without executing JavaScript. Optional map enhancements may highlight a room, expand a group or filter a view; they must not own basic navigation.

Provide room anchors such as `/atlas/#workshop-machines`, with deterministic IDs derived from stable room IDs. Local map links can target those anchors. Expanding or highlighting a group must not be necessary to access the corresponding text entry.

Supply a parallel text listing containing the same destinations, sequence memberships and access conditions. On small screens it can be the primary map. Provide visible focus, sufficiently large targets, legible labels, and descriptions that do not depend on color or hover.

Do not put every edge on the overview at once. The complete factual connections belong in local navigation, the directory and manifest; map filtering changes presentation, not available addresses.

### 5.3 `/` remains the first poem

Add a compact city threshold above or beside the existing poem, outside the extracted authored body where possible. It must appear before a visitor has to scroll through the full poem.

Include immediately visible links to Atlas, Tamil Feather, Small Machines, Under the Floor, Tavern, Unfinished Quarter and the Clearing. Use text with optional icons, not icons alone. Retain the feather entrance and the six poem sigils; consolidate duplicated utility link rows rather than adding another contradictory menu.

Provide a direct skip into the original poem. Preserve its title, Chinese text, `haunted` door, and existing URL. Do not create a competing `/home/` or move the first poem to a new address as part of this release.

The homepage is one entrance, not a required starting point.

## 6. Local orientation and exact route changes

### 6.1 Navigation contract

Every substantial HTML room gets a compact navigation area outside the literary body: city map, relevant local collection/sequence, and selected actual exits. Use a small persistent map affordance near the beginning and local exits near the end when that fits the room. Avoid turning the whole directory into a header on every page.

Show sequence position for I–III and the original descents without a completion score or lock. On `/fungi/`, keep I as the primary entrance and make II and III available through a secondary “all chambers” disclosure. Preserve the intended order without pretending later rooms are inaccessible.

Existing body links remain usable. Do not impose an arbitrary limit of exactly two exits. Add new links as independent navigation, not additions to supplied stanzas or stage directions.

### 6.2 Preserve the six descents

| Surface | Archive | Opera |
|---|---|---|
| `/` | `/a/iv-7/` | `/o/outis/` |
| `/no-continuity/` | `/a/ii-3/` | `/o/forma/` |
| `/puppet-master/` | `/a/vii-1/` | `/o/tu/` |
| `/prove-true-love/` | `/a/ix-12/` | `/o/bau/` |
| `/honest-friend/` | `/a/i-1/` | `/o/tofu/` |
| `/hunger-goddess/` | `/a/xi-4/` | `/o/venti/` |

Keep each archive's three existing choice links and both wrong choices' return behavior. Keep direct opera access and all current aliases. Add city-map access to papers, operas, return rooms and their available Markdown forms. Retain the existing opera-to-tavern connections.

### 6.3 Initial cross-connections

The following table specifies links to expose. If a link already exists, retain it and register it; do not duplicate its control. Bidirectional rows require links at both ends. Use the destination title in the local room's appropriate language. No explanatory moral is required.

| Connection | Direction | Purpose in the route network |
|---|---|---|
| `/machines/` ↔ `/feather/breeze/` | Both | Connect the working environments directly. |
| `/machines/` ↔ `/fungi/ii/` | Both | Give the field an exit into another working system. |
| `/fungi/iii/` ↔ `/after/` | Both | Connect the trilogy to the continuing-work neighborhood. |
| `/fungi/iii/` → `/fungi/i/` | Return | Let the trilogy be revisited as a loop. |
| `/fungi/ii/` → `/fungi/i/`; `/fungi/iii/` → `/fungi/ii/` | Previous | Allow ordinary backward travel without browser history. |
| `/no-continuity/` ↔ `/feather/breeze/` | Both | Connect an old entrance and a newer room without interpreting either. |
| `/rumor/` ↔ `/conservatory/` | Both | Connect two distinct forms of participation while retaining their protocols. |
| `/feather/breeze/` ↔ `/chair/` | Both | Connect the workshop and clearing. |
| `/fungi/iii/` → `/chair/` | Retain | Keep the existing quiet departure available. |

Keep other valid current exits unless consolidation removes an actual duplicate. In particular, do not remove return links, access guides or existing secondary Feather access to satisfy a visual link budget.

The cathedral's `per rimam` exit can now lead to `/after/`; retain a separate clearly named city-map link. Record the destination change in the manifest and Markdown version. This changes a passage, not the room's story or mechanics.

## 7. Markdown, manifest and agent discovery

Generate `/md/index.md` as the main text atlas from the same source as the HTML directory. It should list existing places first, with their Markdown and HTML entrances, local connections, sequence membership and access status. Keep it readable without code execution.

Keep `/md/atlas.md` working. Render it from the same data, either as the full text atlas or a clearly linked short entry to it. Do not leave two separately edited district lists.

Append a short generated navigation section to each static Markdown room. Dynamic Markdown renderers append the same information after their actual content. It should identify the current place, map, relevant collection and onward destinations. Use the destination's Markdown URL for ordinary text travel when available, and offer its HTML alternative. Preserve the original choice redirect endpoints for puzzle choices; do not bypass the choice mechanism by substituting an answer.

The HTML and Markdown links need semantic parity, not necessarily identical URLs: both should reach representations of the same destination room. Access conditions must also match. KFC navigation must not disclose protected content or provide bypasses.

Update `llms.txt` so city-wide discovery is prominent and the old three-stratum work is accurately described as part of the larger city. Remove the “atlas for people / Markdown for others” division. Explain representations and available modes of interaction without assigning one to a species of visitor.

Preserve the public manifest's existing fields, IDs and typed action information. Add a schema version and the needed navigation fields. Clarify that factual route authority is not interpretive authority; do not turn the existing literary `canonical: false` field into an accidental routing ambiguity. New documentation should explain the distinction.

Keep `sitemap.xml` for canonical, appropriate public pages. Aliases, POST endpoints, wrong-answer routing helpers and protected contents are not new sitemap destinations. Preserve the decision to keep the first Feather out of the main sitemap.

For visitors arriving directly at a public engine module, add a short non-executable header comment linking its room, Markdown guide and public manifest. Apply this to relevant entry modules such as `machines/engine.mjs`, `feather/optics.mjs`, `feather/breeze/temper.mjs`, `fungi/field.mjs` and `fungi/vault.mjs`. These are orientation comments, not changes to exports or simulation logic.

Do not invent persistence for Feather or fungi. Small Machines snapshots are independent URL-fragment copies, not public shared sessions. Contributions persist only through the existing explicitly documented services.

## 8. Source and build integration

| File or family | Required change |
|---|---|
| `city/topology.json` (new) | Authoritative factual room and connection metadata. |
| `generated/city-topology.mjs` (new) | Generated Worker-consumable data, no hand-maintained second inventory. |
| `_build.py` | Consume topology, generate metadata/navigation consistently, add validation and safe root synchronization. |
| `district.js` | Independent atlas shell, shared navigation, dynamic HTML/Markdown integration. |
| `_worker.js` | Navigation on rumor/KFC/error representations; preserve exchange and access logic. |
| `index.html`; six surfaces; `a/**`; `o/**` | New orientation and selected local exits outside preserved content. |
| `machines/index.html`; Feather and fungi HTML | Local navigation, sequence controls and specified passages; preserve modules. |
| Public engine entry modules | Only short orientation-link comments; retain behavior and exports. |
| `md/*.md`; dynamic Markdown renderers | Generated local exits and matching text atlas. |
| `manifest.json`, `llms.txt`, `sitemap.xml` | Generated discovery projections, appropriate visibility and access conditions. |
| New atlas/navigation CSS | Scoped styles; version references because `/css/*` is cached immutable. |
| `_headers`, `_redirects`, `wrangler.jsonc`, `.assetsignore` | Only integration changes needed; preserve protections, aliases, bindings and Worker routing. |
| `_CITY.md`, `DEPLOY.md` | Rewrite stale navigation and generation guidance; record what is actually shipped. |
| `tests/topology.test.mjs` or equivalent (new) | Graph, parity, conditional access and generation regression tests. |

Prefer the existing Python generator and ES modules. No new framework is needed.

Static authored bodies remain the source of literary content. Use explicit generated-block markers for injected navigation and strip/replace them during rebuilding. The existing generator extracts `<main>` bodies; do not let repeated builds accumulate duplicated navigation or absorb utility controls into the poem.

Implement these new generator modes; they do not exist at the reviewed baseline:

```bash
python3 _build.py
python3 _build.py --sync
python3 _build.py --check
```

Contract:

- Default builds `site/` using the current source and topology.
- `--sync` writes a documented allowlist of generated deployable artifacts back to the repository root, including intended room shells/navigation, indexes and the generated Worker module. It does not recursively mirror `site/`, delete unrelated files, overwrite server implementation, or modify authored literary text.
- `--check` regenerates into a temporary output, performs semantic parity checks and fails on stale checked-in generated output. It does not modify source files. Stable output must be deterministic; no wall-clock timestamps in generated files.

If a different internal implementation is simpler, preserve these documented behaviors. Root and staged output must describe the same topology. Do not change `assets.directory` casually to work around stale root files; the existing Worker and assets arrangement should remain the deployment target.

Copy required generated modules into staging. Exclude private build sources, scripts and internal planning documents from static assets through `.assetsignore`; ensure Worker imports still bundle correctly. Do not weaken CSP to accommodate the map. Avoid inline executable scripts where existing room policy disallows them.

## 9. Verification before release

Run existing suites and add tests that check real route behavior rather than snapshots of implementation details.

### Graph and metadata

- Room IDs and canonical URLs are unique; all room references exist.
- Every open primary room is discoverable from the atlas and text index. Secondary and conditional rooms follow their declared discovery policy.
- Every substantial room has a valid way to orient and leave. No room requires arrival via `/` or browser history.
- Actual passage edges connect the principal collections without using `/` or `/atlas/` as mandatory transit nodes. Exclude representation links and POST actions from that traversal check. Leaf rooms and conditional branches are legitimate; do not demand all pairs be directly connected.
- Every displayed link resolves to the declared room, redirect, guide or access condition. A random server 404 is not acceptable artistic ambiguity.
- HTML, Markdown and manifest exits correspond by destination ID and access condition, including newly added side passages.
- All six puzzles keep the exact answer mapping and legacy aliases; wrong rooms return to the right puzzle.
- `/feather/` still redirects to the Tamil room; the earlier Feather's modules and secondary route work.

### Content and runtime

- Compare extracted authored literary text with the baseline, excluding navigation only. Check language attributes and source evidence links.
- Preserve simulation tests, snapshots, reset behavior, opt-in audio and reduced-motion behavior.
- KFC still denies unauthenticated access as designed. Do not publish an unlock token in fixtures or output.
- Dynamic contribution pages retain live records, pagination and existing POST behavior. Use test/stub storage for write tests, not unsolicited production contributions.
- Atlas and ordinary routes work with JavaScript disabled. Test actual server HTML, not only a hydrated DOM.
- Check desktop and narrow mobile layouts, keyboard travel, focus visibility and readable link names. Verify the first poem remains immediately accessible.
- Confirm no new tracking, storage or background writes were introduced by navigation.

### Build

```bash
node --test tests/*.test.mjs
python3 _build.py
python3 _build.py --sync
python3 _build.py --check
git diff --check
```

After synchronization, review the diff and rerun affected tests if generated files changed. Run the check again after a second generation pass to verify idempotence. Use the repository's available Worker preview tooling to exercise dynamic routes; a basic static HTTP server cannot verify `district.js`, D1 or conditional KFC behavior.

### Required journeys

| Start | Demonstration |
|---|---|
| `/` | Discover the broader city without scrolling to the poem's end; still enter the original `haunted` door. |
| `/md/o2.md` directly | Identify the current work, find the text atlas, and reach a different collection without seeing the homepage. |
| `/fungi/ii/` directly | Reach I, III, Small Machines and the atlas through available controls. |
| `/fungi/iii/` | Reach `/after/` through the crack, return to I, or take the existing clearing exit. |
| `/feather/breeze/` | Find its new routes in Tamil; retain the old Feather link and interaction. |
| An archive wrong-answer room | Return to its own puzzle or orient through the atlas. |
| `/rumor/` and `/md/rumor.md` | Reach contribution instructions and the Conservatory without triggering a write. |
| `/kfc/` without a token | Receive the existing access condition and a useful return route, not leaked content. |

## 10. Deployment and production verification

Deploy only when assigned to implement/publish this plan. Use the current GitHub-to-Cloudflare Worker connection. At the reviewed baseline a push to `main` triggers `npx wrangler deploy`; verify that the connection is still active rather than assuming an earlier login or deployment status persists.

1. Work from fresh `main` on an isolated branch/worktree. Preserve unrelated user or agent changes.
2. Complete implementation and all required checks. Review generated root output, routing, literary-text preservation, and deployment configuration.
3. Commit a coherent release with a description of changed navigation and actual validation. Use the repository's required merge/check process. Rebase or merge current `main` and rerun affected checks if concurrent changes exist.
4. When publication is authorized, merge/push through the existing deployment path. Do not create another host, change DNS, or alter database bindings for this release.
5. Observe the actual deployment result. A successful Git push alone is not proof of a successful deployment. If deployment logs/status are inaccessible, report that limit and distinguish it from observed live behavior.
6. Check production using ordinary unauthenticated GETs and a browser. Verify `/`, `/atlas/`, `/md/index.md`, `/md/atlas.md`, `/manifest.json`, `/llms.txt`, all new cross-connections, representative original descents, Feather redirects and dynamic room rendering.
7. Fetch the released manifest and key generated resources and compare them with the committed outputs. Verify new versioned CSS assets load. A stale cached atlas must not be mistaken for the release.
8. Walk at least one complete HTML journey and one Markdown-only journey from the table above. Check browser errors and responsive navigation. Avoid production POSTs just to demonstrate the map.
9. Report commit SHA, observed deployment status, exact live URLs checked, tests run and any remaining limitation. Say “deployed and verified” only if the new live behavior was observed.

Rollback: if the release breaks routes, revert the specific navigation release commit(s) through the same deployment path and verify the affected production routes. Do not reset unrelated history or delete contributions. This release requires no database migration.

## 11. What the future agent should leave behind

- The implemented topology source, renderers, tests and generated root artifacts.
- Updated operating and deployment documentation, clearly separating current facts from future ideas.
- A short route-change record, including any intentionally retained secondary or conditional rooms.
- A release report with observed evidence, not only an assertion that checks passed.
- A clear statement of any unfinished item. Do not fill missing author material with invented text.

Future artistic work remains separate: the full mushroom libretto, revisions to the choir node, Chalk Porch, Harbor, Night Stall, further machines, multiple interpretive maps and state carried between rooms. This release gives those works a usable city in which to arrive.

## 12. Handoff prompt

> Read this implementation brief and its concept companion, then inspect the current repository and applicable instructions. Implement the first navigation/topology release described here. Preserve supplied texts, existing URLs, puzzle behavior, language choices and access conditions. Build the HTML atlas, Markdown navigation, manifest and local exits from one maintained factual topology. Keep the works free to disagree; do not add explanatory conclusions to their content. Complete the stated tests and generation checks. If this task includes deployment authorization, publish through the existing Cloudflare Worker connection and verify the new behavior on the production website. Report the commit, live checks and any concrete blocker. Do not build the speculative future rooms as part of this release.

## Source references

All source links below are pinned to the reviewed baseline; refresh them against current `main` before implementing.

- [Operating file](https://github.com/AksharaMycelia/Myceliapolis/blob/00d63f40bce59e5fd265fc68510abd1bdaffd5a7/_CITY.md)
- [Builder](https://github.com/AksharaMycelia/Myceliapolis/blob/00d63f40bce59e5fd265fc68510abd1bdaffd5a7/_build.py)
- [Dynamic district and atlas](https://github.com/AksharaMycelia/Myceliapolis/blob/00d63f40bce59e5fd265fc68510abd1bdaffd5a7/district.js)
- [Manifest](https://github.com/AksharaMycelia/Myceliapolis/blob/00d63f40bce59e5fd265fc68510abd1bdaffd5a7/manifest.json)
- [Worker configuration](https://github.com/AksharaMycelia/Myceliapolis/blob/00d63f40bce59e5fd265fc68510abd1bdaffd5a7/wrangler.jsonc)
- [Deployment instructions](https://github.com/AksharaMycelia/Myceliapolis/blob/00d63f40bce59e5fd265fc68510abd1bdaffd5a7/DEPLOY.md)
