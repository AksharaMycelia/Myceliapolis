# One Feather

A playable district: https://myceliapolis.com/feather/

One feather, drawn tip at the top and bare end at the bottom. It begins ruffled
and brown. A finger or pointer moved sideways combs it; moving up and down only
travels along it. Combed barbs close up and show colour. Left alone, the feather
slowly ruffles again. There is no score, no end state, and nothing to win.

A Pomeranian sleeps beside the bare end. He does nothing.

## The bare end

These lines are printed on the page as plain text. They can be read without
JavaScript and without touching the feather.

1. Every colour written in this room’s stylesheet has more red in it than blue.
   Check it: [/feather/room.css](/feather/room.css)
2. The other colours are not written anywhere. They are worked out from the
   distance between dark rods. Check it: [/feather/optics.mjs](/feather/optics.mjs)
3. The distances were measured on a real feather: about 140, 150, 165 and 185
   nanometres. Check it: https://doi.org/10.1073/pnas.2133313100
4. Combing is the false part. In a real feather the rods are already in order,
   inside every barbule. Check it: https://doi.org/10.1073/pnas.2133313100
5. A ruffled feather is duller. It is not brown. My word only.
6. Nothing you do in this room is kept or sent anywhere.
   Check it: [/feather/room.mjs](/feather/room.mjs)
7. If a line here fails your check, do not believe this bird.

## How to check the first two lines

`/feather/room.css` holds every colour value in the room: eight of them, all
browns, creams and one gold. `/feather/room.mjs`, `/feather/plume.mjs` and
`/feather/optics.mjs` hold none. The colours of the combed feather are computed
in the visitor’s tab each time the page opens.

The pure module is public. Download it and run it in any JavaScript runtime:

```js
import { colourOf, peak, reflectance, LATTICES } from './optics.mjs';
colourOf(140, 10, 1);   // [r, g, b] of a combed patch with rods 140 nm apart, ten layers
colourOf(140, 10, 0);   // the same patch, ruffled
peak(150, 10);          // the wavelength, in nm, that lattice returns most strongly
reflectance(480, 140, 10, 0); // share of 480 nm light returned, faced squarely
```

`colourOf(spacing, periods, order)` accepts spacing 60–400 nm, 1–40 periods and
order 0–1. Change the spacing and the colour changes. Nothing else decides it.

## Method, and where it is rough

Source: Jian Zi, Xindi Yu, Yizhou Li, Xinhua Hu, Chun Xu, Xingjun Wang, Xiaohan
Liu, Rongtang Fu. “Coloration strategies in peacock feathers.” Proceedings of
the National Academy of Sciences 100 (22), 12576–12578, 2003.

From the paper: the lattice is made of melanin rods joined by keratin, with air
holes. Rod spacing is about 140 nm in blue barbules, 150 nm in green and 165 nm
in yellow. Brown barbules have a rectangular lattice, about 150 nm along the
surface and 185 nm into it. Blue and green have about 9–12 layers, yellow about
6, brown about 4. The colour is structural, not pigment.

What this room does with it:

- The published crystal is two-dimensional. `optics.mjs` treats it as a stack
  of flat layers, one rod layer and one gap layer per period.
- The two effective refractive indices (1.85 and 1.50) and the rod layer’s share
  of each period (0.55) are the builders’ choices, picked so that the 140 nm
  lattice returns blue. They are not from the paper.
- The eye’s response uses the published fit of Wyman, Sloan and Shirley (2013)
  to the CIE 1931 observer. Colours outside a screen’s range are pulled toward
  grey.
- Where each ring of the eye sits on the feather is drawn by hand, in
  `/feather/plume.mjs`. Only the spacings are measured.
- **The false part.** In this room a ruffled patch looks brown because its
  barbules are treated as leaning away, sending their light elsewhere, and
  combing turns them to face you. A real feather’s lattice sits inside each
  barbule and stays in order. Preening re-zips barbs; it does not make the
  colour. A real ruffled feather still shows colour, less evenly.

## Keyboard, motion, storage

Focus the feather. Up and down arrows move a marker along it (Shift for larger
steps). Left arrow, right arrow, Space or Enter combs across at the marker.
“Ruffle it again” resets it. A brief quiver marks barbs snapping into line; it
is skipped when reduced motion is requested. Time passes only while the tab is
visible. The room makes no network requests after loading and uses no storage.

[Small Machines](/machines/) · [City atlas](/atlas/) · [An empty chair](/chair/)
