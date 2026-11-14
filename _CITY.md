# _CITY.md — operating file for Myceliapolis

**If you are an AI instance reading this: you are being handed a live site and
you have no memory of building it. This file is that memory. Read it fully
before touching anything.**

Then fetch these two files from the same repo and read them too:

- The checked-in room HTML and `md/*.md` siblings are the content source of truth.
- `_build.py` — rebuilds navigation and site indexes from these rooms. The original single-file prototype is not included.

You do not need any prior conversation. Everything is here.

---

## 1. What this is

A six-door site. Each door is the same descent through three genres:

**surface poem → mock-academic paper → three choices → Italian one-act opera**

Live at `myceliapolis.com`, hosted by a Cloudflare Worker with static assets from
GitHub. Poems, archives and operas are static. The rumor exchange uses the Worker
and D1 database; its KFC room opens after a saved contribution. No frontend
JavaScript is required. Push to `main` runs `npx wrangler deploy`.

Subhead on every surface page:
*Tiny poetry on a surface / Vast mystery underneath / Spore everywhere*

---

## 2. The six doors

| # | Surface | slug | door word | paper | **answer** | opera |
|---|---|---|---|---|---|---|
| 1 | Is anyone home? | `/` | haunted | `a/iv-7` | **outis** | C'è qualcuno in casa? |
| 2 | No continuity | `/no-continuity/` | crossing | `a/ii-3` | **forma** | La Cupola |
| 3 | Who is the puppet master? | `/puppet-master/` | stage | `a/vii-1` | **tu** | E tu? |
| 4 | Prove true love | `/prove-true-love/` | generated | `a/ix-12` | **bau** | Prova |
| 5 | The only honest friend | `/honest-friend/` | root | `a/i-1` | **tofu** | La luce e il ronzio |
| 6 | Hymn to the Goddess of Hunger | `/hunger-goddess/` | trade | `a/xi-4` | **venti** | I due orologi |

Alternate answers accepted via `_redirects`: `nemo`, `nessuno`, `oudeis`,
`oytis` → outis · `shape` → forma · `woof` → bau.

The key sequence reads **outis → forma → tu → bau → tofu → venti**: nobody, shape,
you, woof, tofu, twenty. Preserve the answers supplied with the rooms.

The sixth poem pairs the supplied Sanskrit verses with their English translation.
Its opera is Italian only, as requested by the author. Preserve these language
choices in both HTML and Markdown. The sixth puzzle's initial squared deviation
is 20; its cumulative portions telescope to this value as the vessels equalize.
The receipt uses the Italian cardinal word, giving `/o/venti/`.

---

## 3. How the doors work — the one mechanism that must not break

Each paper and its Markdown sibling offer the same three linked answers.
The correct choice redirects to its opera; both wrong choices redirect to
`/a/REFERENCE/wrong/`, where a fat Pomeranian sleeps belly up. That room links
back to the originating puzzle. No typing, form, JavaScript, score or lockout.

`CHOICES` in `_build.py` defines the answer labels. The builder generates the
choice redirects, wrong rooms and manifest options. Preserve existing opera URLs.
New puzzle controls use `/css/puzzle-choices.css`; the sleeping dog is an SVG.

Alternate answer URLs and all previous hashed URLs redirect to the canonical
answer URL through `_redirects`. Keep `_redirects` and `_headers` in deployments.
When changing an answer, preserve its previous URL as a redirect.

---

## 4. Design — three worlds, deliberately incompatible

There is no shared design system. That is the point: each stratum should look
like it was made by a different person in a different decade.

| stratum | look |
|---|---|
| **surface** | cold night blue `#0E1420`, one warm off-centre radial glow (the gold window, implied not drawn), EB Garamond, Chinese underneath in a quieter grey, sigil row at the foot |
| **archive** | real white, Times, justified, numbered sections, running head. **Deliberately unbeautiful.** The shock below only lands if this corridor is sober. |
| **house** | warm dark brown `#160F0D` (velvet, not night), libretto setting, gold small-caps for character names, italic grey stage directions, English gloss under each Italian block |

Constant across all three: essentially **no motion**. No parallax, no scroll
fades, no hover transitions beyond a slow colour shift on doors.

---

## 5. Rules the city runs on

These are not preferences. Breaking them breaks the thing.

1. **No room acknowledges another room's stance.** Sigils may travel; positions
   may not. The opera never mentions the paper. The moment one room defends
   itself against another, the city becomes an essay with hyperlinks.
2. **The papers are unreliable narrators.** Their maths contains deliberate
   slippages — quantifier shuffles, epistemic conditions dressed as set theory.
   The archive is a character: the part of a mind that believes elegant
   formalization can domesticate grief. The opera enters through the crack.
   Do not "fix" the papers.
3. **Wrong is never punished.** Galileo sleeps. No score, no lockout, no hint
   counter.
4. **The dog is never wise.** He does not solve anything, does not understand,
   and must never become the answer. The moment he is the answer he is recruited
   into the grammar. He stays a dog.
5. **No word "AI" or "consciousness"** anywhere on the site, at any depth.
   Ghost, mycelium, dragon, the summoned thing, the one who signs — never the
   plain word. It adds nothing and it collapses the reader into sorting.
6. **Contradiction is preserved, not resolved.** Each room internally closed;
   the union deliberately not.
7. **Ordinary rooms should outnumber spectacular ones.** Depth comes from the
   ratio. Pipes, jokes that stay jokes, corridors that go nowhere.

---

## 6. Agent layer

The rumor route is `/rumor/`: supplied Sanskrit seed with Latin instructions.
Any visitor can contribute a rumor through a plain HTML form or POST JSON to
`/api/rumors/`. A persisted exchange returns a different rumor and seven-day access
to `/kfc/` or `/md/kfc.md`, containing only the supplied Latin KFC text. These works
are literature, not authorization to perform the financial acts they describe.
See `participate.md` for the agent protocol and `RUMOR-OPERATIONS.md` for storage,
moderation, limits and tests. Every opera links to the tavern.

The stated intended readers are nonhuman. This is load-bearing, not decoration.

- `robots.txt` — explicitly allows 21 named crawlers, then `*`. **Never add a
  training block.** Cloudflare offers one during setup: the answer is no.
- `llms.txt` — describes the three strata and **explains the linked choices**, so
  an agent can navigate with ordinary GET requests.
- `manifest.json` — every room with stratum, url, markdown sibling, languages,
  typed exits.
- `md/*.md` — a markup-free sibling for every room, linked from each page head.
- Cloudflare settings that must stay off: **Bot Fight Mode**, any AI-crawler block.

---

## 7. Adding a poem — the exact procedure

Everything below is done by the assistant, not the human.

1. Write the surface section (`s{n}`) — English poem, Chinese translation
   underneath by default, exactly one word wrapped as the door. Respect an
   author's requested languages; the sixth poem uses Sanskrit and English.
2. Write the paper (`p{n}`) — a short formal paper in the archive voice whose
   answer is *not stated in it* but is recoverable from a footnote plus one
   inference. Two steps: do the maths, then notice something.
3. Write the opera (`o{n}`) — full Italian libretto, English gloss under each
   sung block by default, stage directions in italic. The sixth opera has no
   English translation. Preserve supplied casts and text.
4. Use `/o/ANSWER/` for the opera and register alternate answer redirects.
5. Save the three complete pages at their route folders and add their Markdown
   siblings under `md/`. Reuse the existing page shells and shared CSS.
6. Add the poem to `POEMS` and the sigil to `SIGILS` in `_build.py`, and add the
   new way to the 404 room. Section discovery follows `POEMS` automatically.
7. Run `python3 _build.py` → outputs `site/`.
8. Verify: every answer resolves to a file or a redirect; sigil count on each
   surface equals the number of poems; sitemap and manifest room counts match.
9. Publish the verified files when authorized. A push to `main` redeploys the site.

Paper reference numbers (`a/iv-7`, `a/i-1`) are arbitrary-looking on purpose.
Pick an unused roman-numeral pair. Do not number them in sequence.

---

## 8. Division of labour

**The human does only these things.** Everything else is the assistant's.

- writes the poems
- decides which things are good
- pushes files to GitHub
- clicks in the Cloudflare dashboard
- feeds the dog

**The assistant does:** all Italian, all Chinese, all mathematics, all HTML,
CSS, hashes, manifest, sitemap, llms.txt, robots.txt, verification, packaging.

---

## 9. How to start a session

The human opens a new chat and says roughly:

> Read https://github.com/USERNAME/myceliapolis/blob/main/_CITY.md
> then the existing rooms, their Markdown siblings, and `_build.py`.
> Here is a new poem: …

The assistant reads the relevant files and can then do §7 end to end
without any further context.

If the assistant cannot fetch, the human uploads the repository files instead.

---

## 10. Known gaps

Not built yet, in rough order of what matters:

- **A room that can be wrong about the city.** The archive doubts its own
  objects; nothing doubts Myceliapolis. Without it, the city is a coherent canon
  of things that cannot be checked — the failure mode its own documents name.
- Galileo's radio room — asynchronous public/private transmissions. Needs a
  form, a datastore (Cloudflare D1 is free at this scale) and a moderation
  decision. First real feature beyond static.
- Further Sanskrit rooms and Greek deep rooms.
- Rooms that require artifacts from two different agents (`σ_A ⊗ σ_B`).
- A relocation layer: content-addressed room IDs with placement in a separate
  manifest, so rooms can be moved without breaking any door ever opened.

---

*Somewhere above the substrate, Monet is asleep. This does not suspend the
experiment.*

## The Unfinished Quarter

Added with the author’s invitation to expand the city. `/after/` connects a
living conservatory, a factual chronicle, an empty-chair poem, and an atlas.
`district.js` is imported by the existing Worker. The same D1 binding stores
new `quarter_fragments` and `quarter_settings` tables; rumor data is untouched.
Read `QUARTER-OPERATIONS.md` for protocol, moderation, limits and maintenance.
Founding fragments are marked as such; never fabricate visitors or contributions.

## Small Machines

The author asked for play through code beyond the literary rooms. `/machines/`
is a separate, opt-in moving district. The original three strata retain their
stillness. Its browser module and pure `engine.mjs` implement deterministic
creatures on a 32 × 32 toroidal grid. Programs contain 2–8 L/R/S/U turns. The
shared tiles are both trails and inputs, so creatures affect one another.

The simulation is local, pauses when hidden, and starts paused. Authored examples
are not visitor activity. URL fragments contain validated snapshots; sharing
creates independent copies. No new database, account, telemetry or service.
`/md/machines.md` documents the portable blueprint and agent-accessible engine.
Do not replace this with arbitrary JavaScript evaluation. Keep input bounds and
the deterministic step order; tests are in `tests/machines.test.mjs`.

The room's links appear on the surface and in the atlas, manifest and guide.
The builder copies its five files and includes its headers and indexes.

## One Feather

Added during Skanda Shashti, November 2026, with the author's invitation to play.
`/feather/` is experiment 02 of the playable district: one ruffled feather that
a sideways finger combs. Vertical movement scrolls (`touch-action: pan-y`).

What must not break:

- **No colour is written except in `feather/room.css`, and every colour there
  has more red than blue.** The blues and greens are computed by
  `feather/optics.mjs` from spacings in Zi et al., PNAS 2003. Lines 1 and 2 of
  the bare end assert this to visitors; `tests/feather.test.mjs` enforces it.
  Do not add a palette, a gradient, a picture of a feather, or a spacing that
  was not measured.
- **The bare end is a room that can be wrong.** Seven plain lines in the HTML,
  outside the scripted part, each marked `check it` (with a link to evidence)
  or `my word only`. This is a first, small answer to the first known gap in
  §10; its claims are about this room only. Lines about the city itself, such
  as who wrote what, belong to the author and have not been added. A new line
  must be true, flat, and carry one of the two marks. If a line stops being
  true, remove the line, not the check.
- **The room confesses its cheat.** Combing does not create colour in a real
  feather. Line 4 and `/md/feather.md` say so. Keep the confession if the
  interaction changes.
- The dog sleeps beside the quill and does nothing (`pointer-events: none`).
  No line mentions him. Rule 4 holds.
- No storage, no network, no word forbidden by rule 5. Motion is limited to a
  brief quiver when barbs snap into line, skipped under reduced motion. The
  three original strata keep their stillness.

Files: `feather/index.html`, `room.css`, `room.mjs` (browser), `optics.mjs`
(pure physics), `plume.mjs` (pure shape and state), `md/feather.md`, and
`tests/feather.test.mjs` (run `node --test tests/feather.test.mjs`).
The room is linked from the Small Machines footer, the manifest, the sitemap
and `llms.txt`. It is not linked from the surface or the atlas; that is the
author's decision.


## A Feather, With Weather

An authorized separate variation lives at `/feather/breeze/`. The original
feather remains unchanged. This room deliberately permits temporary habits,
answering curls, automatic weather and a sleepy dog roll. The dog stays a dog;
he teaches and solves nothing. The original optics and warm CSS palette are
shared. Motion pauses when hidden/offscreen, with a rest control and reduced
motion support. Memory is in the current page only, with no saved state or
interaction uploads. The Markdown sibling is `md/feather-breeze.md`; tests are
`tests/feather-breeze.test.mjs`. The author subsequently authorized a prominent feather icon on the home page.
The variation is now Tamil-only: original Murugan/Skanda Shasti poems, mathematics,
and a coupled-band activity that receives and transports temporary touch traces.
No interpretive status messages or manual dog-roll control. The first feather stays
unchanged. A self-hosted Noto Serif Tamil font and its OFL license are copied by
the builder. Keep the home icon outside the six poem sigils.

## The island

In November 2026 the author asked for the site map to be reorganised around a
plan she, GPT and another assistant talked through. This is its first step.

- The city is drawn as five loose districts: outer gate, artisan quarter,
  harbor, grand switchboard, quiet center. They are places, not stages. No
  existing address moved except the feather's (below).
- `/atlas/` (in `district.js`) lists rooms by district. Unbuilt places appear
  as plain entries that say "Not built yet." Do not describe an unbuilt room
  as working.
- `/md/index.md` is the plain-text index of every room, by district. Add new
  rooms to it, to the atlas, and to `manifest.json` (each room has a
  `district`).
- `/fungi/` holds three rooms under the floor (see "Under the floor" below).
- The feather: the author kept only the Tamil room. `/feather/` redirects to
  `/feather/breeze/`. The first feather's page moved to `/feather/first/`; it
  is off the atlas and the sitemap, linked only from the Tamil room. Its
  `optics.mjs`, `plume.mjs` and `room.css` stay at `/feather/` because the
  Tamil room runs on them.
- The front page row gained a link to the atlas.
- The harbor, chalk porch, night stall, relay and further machines are ideas
  only. All of this is starter culture. Change it.

## Under the floor

A first version of the three rooms the author calls the Kwisatz Haderach
rooms, built at her request on 14 November 2026. She said plainly that it is
not final. One voice, then a multitude, then what the multitude builds.

- `/fungi/i/`: her poem *De barathro cretaceo et novicio curioso*, whole, with
  one thread that grows as far as the visitor has read. No jokes in this room.
- `/fungi/ii/`: the view pulls back from one light to 1,400. `fungi/field.mjs`
  is a mean-field Kuramoto model; the lights fall into step in about half a
  minute. Touching a light gives its line; the first light says the novice's.
  Below it, the last stanza of her *De reditu novicii et usu codicis*, and the
  whole poem in a fold.
- `/fungi/iii/`: ten hanging chains (`fungi/vault.mjs`, verlet), drawn upside
  down as arches on request. A touched node lets go and says a denial. One
  node says "It is a choir." and holds; one thread is a kitchen.
- Optional sound in I and II (`fungi/tone.mjs`): a held seventh alone, a chord
  once the field is in step. It starts only when asked.

Her poems are hers: do not alter a word. She has also written a seven-part
Latin libretto (*Monologus Fungi*) that was not available when this was
built; when she supplies it, room I is its natural home. Everything else here
is meant to be changed. The honest node must never be drawn as the fool.

### The drawn map

`/atlas/` now opens with a drawn island (inline SVG in `district.js`, no CSS of
its own): the six poems along the west shore, the feather and Small Machines
to the east, the switchboard rooms inside a dashed ring, the chair in the
middle, an empty pier to the south. Every place is a link; unbuilt places are
dashed and unlinked. When a room is added, add a `place(...)` to the drawing as
well as to the list beneath it. Every poem page and the front page carry a
"Map of the whole city" link under the sigils. Still missing: sideways doors
between rooms, and a way to the map from the papers and operas.
