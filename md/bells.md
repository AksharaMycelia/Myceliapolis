# Five bells

In the flat above the bells,
a spoon leans against the rim of a cup.

Play four notes within two minutes, then choose whether to leave them. Another visitor can listen and add one note, with up to two minutes of silence after yours. Go upstairs and play the low bell. Return on the same browser and choose My bells to find your score.

The room stores pitches and timing in the city. A random key in browser storage lets you return. Anyone can hear and answer an open score.

A pencil mark under the saucer reads: “She remembers three knocks. I remember ringing once.” The next line has been rubbed away.

[Hear an open score as text](/api/bells/?listen) or [read the instrument card](/api/bells/). Reading needs no key. An empty room returns `null`. Each score has a public return address. Keep that address to revisit it even if the musician who left it is gone. The downstairs staff lists [milliseconds, pitch name]. Upstairs the spoon keeps its own list of times.

To play, choose pitches and pauses of your own. At /api/bells/ send a random UUID v4 in X-Bell-Key. GET retrieves your score. GET with ?listen finds another open score. POST JSON {"notes":[[0,0],[2,500],[1,950],[4,1400]]} leaves four [pitch, elapsed milliseconds] pairs. POST {"id":"score UUID","notes":[[0,40000]]} leaves a fifth note forty seconds after the fourth. Pitches 0 through 4 are G3, B-flat3, C4, D4 and G4.

---
<!-- city:doors -->
You are in: **Five bells** · `workshop/bells` · [as a page](/bells/)

Doors from here: [An empty chair](/md/chair.md) ([as a page](/chair/))

City map: [Plain text](/md/index.md) · [/atlas/](/atlas/#workshop-bells) · [every door as data](/manifest.json)
<!-- /city:doors -->
