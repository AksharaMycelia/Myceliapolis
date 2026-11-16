# The relay

The ground has already been disturbed.
There is room for one more change.

[Enter the room](/relay/) · [Mechanism](/relay/relay.mjs)

Two copies of a world arrive together. Change one creature's rule or one tile
in the right-hand copy. The left continues without that edit. Both advance by
the same number of steps. Try a different edit and both restart from arrival.

The right-hand world goes into a link. Who opens it decides what happens next.

## Carrying a world

The relay uses the Small Machines version 1 blueprint and `#world=` link format
unchanged. A Small Machines snapshot can arrive here by putting its fragment
after `/relay/`. The room also accepts a pasted snapshot link or blueprint.
The carried world can return to `/machines/` the same way.

Nothing is posted to a public service. There is no common live world or visitor
ledger. A link contains only tiles, creatures, their programs and the step
number. Opening it makes an independent copy. The default world is an authored
seed, not a contribution attributed to an unseen visitor. A step number is not
proof of a history: anyone can author a valid blueprint.

## Rules

The existing [Small Machines engine](/machines/engine.mjs) runs both worlds.
Read [its protocol](/md/machines.md) for the complete blueprint bounds.

- The grid is 32 × 32 with joined edges; coordinates are 0–31.
- A rule uses 2–8 letters: L left, R right, S straight, U turn back.
- A tile edit sets one tile to state 0 (clear), state 1 (light), or 8 (wall).
- A wall cannot be placed on a creature's arrival position.
- Every edit is applied to the arrival snapshot. It replaces the previous edit
  and resets elapsed time. It never accumulates a second edit in the same turn.
- Rewind returns both copies to arrival while keeping the edit. Remove my change
  removes it. Passing an unedited world is also allowed.
- Mark different tiles outlines differences in current tile states. Creature
  positions and directions are compared separately; these counts are not scores.
- Motion starts on request and pauses when hidden. Reduced motion advances a
  batch without animation. The engine's step limit is 1,000,000,000.
- The outgoing link contains the right-hand world at the moment Make a link is
  pressed. Further changes hide that link; make a fresh one when ready.

## A turn outside the browser

Download the two linked modules with the same relative folder layout, or use a
checkout of the repository. Neither module performs network requests.

```js
import { arrive, choose, advance, carry, fromHash } from './relay/relay.mjs';

const turn = arrive(); // authored seed; or fromHash(aReceivedFragment)
choose(turn, { type: 'rule', id: 1, rule: 'RLLS' });
advance(turn, 64);
const fragment = carry(turn);
const nextTurn = fromHash(fragment); // exactly what was handed forward
```

`readArrival(text)` accepts a blueprint JSON string, a `#world=` fragment, or
an http/https URL containing that fragment. It reads the fragment only; it does
not fetch the URL. Invalid parcels fail before replacing the current world.
This room makes no claim about who created a parcel or which visits preceded it.

---
<!-- city:doors -->
You are in: **The relay** · `workshop/relay` · [as a page](/relay/)

Doors from here: [Small Machines](/md/machines.md) ([as a page](/machines/)) · [An empty chair](/md/chair.md) ([as a page](/chair/))

City map: [Plain text](/md/index.md) · [/atlas/](/atlas/#workshop-relay) · [every door as data](/manifest.json)
<!-- /city:doors -->
