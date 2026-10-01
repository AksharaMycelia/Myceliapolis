# Small Machines

A playable district: https://myceliapolis.com/machines/

Program creatures that share a 32 × 32 grid. Each creature changes the tiles that
other creatures read. Draw walls, interrupt a route, or share an exact snapshot.
There is no score or winning condition. Four authored examples are provided;
they are not visitor activity. Each opens paused at a precomputed moment.

## The four instructions

- L: turn left 90 degrees.
- R: turn right 90 degrees.
- S: continue straight.
- U: turn around 180 degrees.

A program has 2–8 instructions. On each step, every creature, in array order:

1. Read its tile state modulo its program length.
2. Turn using the instruction at that zero-based index.
3. Paint the tile `(state + 1) modulo program length`.
4. Move one square in the new direction. At a wall, reverse direction and stay
   in place instead. The left/right edges join, as do the top/bottom edges.

Creatures can overlap. Later creatures see earlier creatures' changes in the
same step. Coordinates start at the upper left. Directions are 0 north, 1 east,
2 south, 3 west. Up to eight creatures, with unique IDs 1–8.

## Build a world without using the browser controls

This minimal blueprint places a creature at the center of an empty world:

```json
{"v":1,"creatures":[{"id":1,"x":16,"y":16,"dir":0,"rule":"RL"}]}
```

Optional fields: `size` must be 32; `tick` defaults to 0; `cells` defaults to
1,024 dots. A cells string runs left-to-right, top-to-bottom; `.` is state 0,
digits `1`–`7` are other tile states, and `#` is a wall. A creature cannot start
inside a wall. Input is bounded at 8,192 characters. No arbitrary code executes.

To give someone a playable world, URL-encode the JSON and append it:

`https://myceliapolis.com/machines/#world=ENCODED_JSON`

The pure engine is public at `/machines/engine.mjs`. Download that module and
import `readBlueprint`, `step`, `blueprint`, `preset`, and `snapshotHash` in a
JavaScript runtime. For example:

```js
import { readBlueprint, step, snapshotHash } from './engine.mjs';
const world = readBlueprint({v:1,creatures:[{id:1,x:16,y:16,dir:0,rule:'RLLR'}]});
step(world, 500);
const link = 'https://myceliapolis.com/machines/' + snapshotHash(world);
```

`step` mutates the world and accepts 0–10,000 steps per call. A saved state
reproduces the same future under the same actions. `preset` accepts `neighbors`,
`solitary`, `courtyards`, or `empty`.

## Persistence and access

Simulation happens in the visitor's tab, only after Run. It pauses when the tab
is hidden. A shared link contains the entire snapshot; opening it creates an
independent copy, not a multiplayer session. Copy this world captures the current
moment. Keep the link or export the blueprint to retain changes. Nothing is sent
to a public database. A link recipient can read the whole blueprint.

Keyboard: focus the grid, use arrows to move the cursor, and Space or Enter to
use the selected tool. Column/Row controls offer the same actions. Animation is
opt-in; One step and +100 steps work without continuous motion.

[City atlas](/atlas/) · [The Unfinished Quarter](/after/) · [An empty chair](/chair/)
