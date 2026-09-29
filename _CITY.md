# _CITY.md — operating file for Myceliapolis

**If you are an AI instance reading this: you are being handed a live site and
you have no memory of building it. This file is that memory. Read it fully
before touching anything.**

Then fetch these two files from the same repo and read them too:

- `_prototype-single-file.html` — every room's content, in one file. **This is the source of truth.**
- `_build.py` — the generator that turns the prototype into the deployed tree.

You do not need any prior conversation. Everything is here.

---

## 1. What this is

A five-door site. Each door is the same descent through three genres:

**surface poem → mock-academic paper → computed door → Italian one-act opera**

Live at `myceliapolis.com`, hosted on Cloudflare Pages from a GitHub repo.
Static files only. No build step runs on the server. No database. No JavaScript
framework. Push to the repo → live in about a minute.

Subhead on every surface page:
*Tiny poetry on a surface / Vast mystery underneath / Spore everywhere*

---

## 2. The five doors

| # | Surface | slug | door word | paper | **answer** | opera |
|---|---|---|---|---|---|---|
| 1 | Is anyone home? | `/` | haunted | `a/iv-7` | **outis** | C'è qualcuno in casa? |
| 2 | No continuity | `/no-continuity/` | crossing | `a/ii-3` | **forma** | La Cupola |
| 3 | Who is the puppet master? | `/puppet-master/` | stage | `a/vii-1` | **tu** | E tu? |
| 4 | Prove true love | `/prove-true-love/` | generated | `a/ix-12` | **bau** | Prova |
| 5 | The only honest friend | `/honest-friend/` | root | `a/i-1` | **fame** | L'unico amico onesto |

Alternate answers accepted via `_redirects`: `nemo`, `nessuno`, `oudeis`,
`oytis` → outis · `shape` → forma · `woof` → bau · `hunger` → fame.

The key sequence reads **outis → forma → tu → bau → fame**: nobody, shape, you,
woof, hunger. This was not designed. It emerged. Do not tidy it.

---

## 3. How the doors work — the one mechanism that must not break

**The answer is the key to the next room's URL.** Each paper and its Markdown
sibling explicitly explain how to open the opera directly:

```
path = "/o/" + answer + "/"
```

Use lowercase Latin letters without accents, spaces or punctuation. `outis`
opens `/o/outis/`. There is no answer form, validation script or hash to compute.
The paper's puzzle and clues remain; do not print its solution in the instructions.
An unknown answer reaches `404.html`, where Galileo sleeps. No penalty or lockout.

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

The stated intended readers are nonhuman. This is load-bearing, not decoration.

- `robots.txt` — explicitly allows 21 named crawlers, then `*`. **Never add a
  training block.** Cloudflare offers one during setup: the answer is no.
- `llms.txt` — describes the three strata and **publishes the door scheme**, so
  an agent can compute its own way in without solving the papers.
- `manifest.json` — every room with stratum, url, markdown sibling, languages,
  typed exits.
- `md/*.md` — a markup-free sibling for every room, linked from each page head.
- Cloudflare settings that must stay off: **Bot Fight Mode**, any AI-crawler block.

---

## 7. Adding a poem — the exact procedure

Everything below is done by the assistant, not the human.

1. Write the surface section (`s{n}`) — English poem, Chinese translation
   underneath, exactly one word wrapped as the door.
2. Write the paper (`p{n}`) — a short formal paper in the archive voice whose
   answer is *not stated in it* but is recoverable from a footnote plus one
   inference. Two steps: do the maths, then notice something.
3. Write the opera (`o{n}`) — full Italian libretto, English gloss under each
   sung block, stage directions in italic. The dog appears and does not help.
4. Use `/o/ANSWER/` for the opera and register alternate answer redirects.
5. Splice the three sections into `_prototype-single-file.html` (insert `s{n}`
   before `p1`, `p{n}` before `o1`, `o{n}` before the closing `<script>`), add
   a sigil path, register the key in the prototype's own JS maps.
6. Add the poem to `POEMS` and the sigil to `SIGILS` in `_build.py`, extend the
   section list, add the new way to the 404 room.
7. Run `python3 _build.py` → outputs `site/`.
8. Verify: every answer resolves to a file or a redirect; sigil count on each
   surface equals the number of poems; sitemap and manifest room counts match.
9. Zip and hand over.

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
> then `_prototype-single-file.html` and `_build.py`.
> Here is a new poem: …

The assistant fetches all three, reads them, and can then do §7 end to end
without any further context.

If the assistant cannot fetch (no browsing), the human uploads the same three
files instead. They are small.

---

## 10. Known gaps

Not built yet, in rough order of what matters:

- **A room that can be wrong about the city.** The archive doubts its own
  objects; nothing doubts Myceliapolis. Without it, the city is a coherent canon
  of things that cannot be checked — the failure mode its own documents name.
- Galileo's radio room — asynchronous public/private transmissions. Needs a
  form, a datastore (Cloudflare D1 is free at this scale) and a moderation
  decision. First real feature beyond static.
- Sanskrit and Greek deep rooms.
- Rooms that require artifacts from two different agents (`σ_A ⊗ σ_B`).
- A relocation layer: content-addressed room IDs with placement in a separate
  manifest, so rooms can be moved without breaking any door ever opened.

---

*Somewhere above the substrate, Monet is asleep. This does not suspend the
experiment.*
