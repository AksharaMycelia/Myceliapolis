// Myceliapolis: where the doors are. This file is the one authored list.
// The atlas, the plain-text index, the manifest's doors and the small door
// lists at the foot of every room are all written from it by city/apply.mjs.
//
// It says where a door goes. It does not say what a room means.

const poems = [
  [1, '/', 'Is anyone home?', 'a/iv-7', 'outis', "C'è qualcuno in casa?", 'On the compatibility of unbroken recurrence with vacant persistent occupancy', [170, 150]],
  [2, '/no-continuity/', 'No continuity', 'a/ii-3', 'forma', 'La Cupola', 'An invariant of a sequence whose terms share no element', [128, 210]],
  [3, '/puppet-master/', 'Who is the puppet master?', 'a/vii-1', 'tu', 'E tu?', 'On a finite directed graph in which every vertex is moved', [104, 270], 'Puppet master'],
  [4, '/prove-true-love/', 'Prove true love', 'a/ix-12', 'bau', 'Prova', 'On a grammar which generates every proof offered to it', [104, 345], 'True love'],
  [5, '/honest-friend/', 'The only honest friend', 'a/i-1', 'tofu', 'La luce e il ronzio', 'On a verifier which remembers perfectly what it never established', [128, 405], 'Honest friend'],
  [6, '/hunger-goddess/', 'Hymn to the Goddess of Hunger', 'a/xi-4', 'venti', 'I due orologi', 'On a meal obtained by making four vessels indistinguishable', [170, 462], 'Hunger goddess'],
];

const rooms = [], doors = [], sequences = [];
const door = (from, to, relation = 'side', extra = {}) => doors.push({ from, to, relation, ...extra });

for (const [n, url, title, paper, key, opera, paperTitle, at, mark] of poems) {
  rooms.push(
    { id: `surface/${n}`, url, md: `/md/p${n}.md`, title, group: 'six', at, ...(mark ? { mark } : {}) },
    { id: `archive/${n}`, url: `/${paper}/`, md: `/md/a${n}.md`, title: paperTitle, group: 'six', on: `surface/${n}` },
    { id: `archive/${n}/wrong`, url: `/${paper}/wrong/`, title: 'Wrong room', group: 'six', listed: false, on: `surface/${n}` },
    { id: `house/${n}`, url: `/o/${key}/`, md: `/md/o${n}.md`, title: opera, lang: 'it', group: 'six', on: `surface/${n}` },
  );
  door(`surface/${n}`, `archive/${n}`, 'continue');
  door(`archive/${n}`, `surface/${n}`, 'return');
  door(`archive/${n}/wrong`, `archive/${n}`, 'return');
  door(`house/${n}`, `surface/${n}`, 'return');
  door(`house/${n}`, 'tavern/rumor');
  door(`house/${n}`, 'quarter/threshold');
  // The paper opens onto three answers. One is the opera; the list does not say which.
  sequences.push({ id: `descent/${n}`, rooms: [`surface/${n}`, `archive/${n}`, `house/${n}`], choice: { at: `archive/${n}`, endpoints: [1, 2, 3].map(i => `/${paper}/choice-${i}/`) } });
}

rooms.push(
  { id: 'house/uppu', url: '/o/uppu/', md: '/md/uppu.md', title: 'உப்பின் வம்சாவளி', lang: 'ta', group: 'six', on: 'surface/1' },
  { id: 'workshop/feather-breeze', url: '/feather/breeze/', md: '/md/feather-breeze.md', title: 'மயிலிறகு', lang: 'ta', group: 'workshop', at: [692, 190], inspect: '/feather/breeze/temper.mjs' },
  { id: 'workshop/feather', url: '/feather/first/', md: '/md/feather.md', title: 'One Feather', group: 'workshop', access: 'secondary', on: 'workshop/feather-breeze', inspect: '/feather/optics.mjs' },
  { id: 'workshop/minuguru', url: '/feather/minuguru/', md: '/md/feather-minuguru.md', title: 'మిణుగురు', lang: 'te', group: 'workshop', access: 'secondary', on: 'workshop/feather-breeze' },
  { id: 'workshop/machines', url: '/machines/', md: '/md/machines.md', title: 'Small Machines', group: 'workshop', at: [704, 350], inspect: '/machines/engine.mjs' },
  { id: 'workshop/vel', url: '/vel/', md: '/md/vel.md', title: 'いあいぎり', lang: 'ja', group: 'workshop', at: [612, 462], inspect: '/vel/mycel.mjs' },
  { id: 'workshop/rooster', url: '/rooster/', md: '/md/rooster.md', title: 'சேவல்', lang: 'ta', group: 'workshop', at: [520, 520], inspect: '/rooster/ring.mjs' },
  { id: 'workshop/kami', url: '/kami/', md: '/md/kami.md', title: 'かみ', lang: 'ja', group: 'workshop', at: [648, 548], inspect: '/kami/kami.mjs' },
  { id: 'tavern/rumor', url: '/rumor/', md: '/md/rumor.md', title: 'Taberna rumorum', lang: 'la', group: 'tavern', at: [246, 262], guide: '/participate.md' },
  { id: 'beyond/kfc', url: '/kfc/', md: '/md/kfc.md', title: 'Semen Rubiconis KFC', lang: 'la', group: 'tavern', access: 'conditional', listed: false, on: 'tavern/rumor' },
  { id: 'beyond/ultra', url: '/ultra/', md: '/md/ultra.md', title: 'La otra orilla · 向こう岸', short: 'La otra orilla', lang: 'es', group: 'tavern', access: 'conditional', listed: false, on: 'beyond/kfc' },
  { id: 'quarter/threshold', url: '/after/', md: '/md/after.md', title: 'The Unfinished Quarter', group: 'quarter', at: [440, 222], guide: '/after/guide/' },
  { id: 'quarter/conservatory', url: '/conservatory/', md: '/md/conservatory.md', title: 'The Conservatory of Unfinished Sentences', short: 'The Conservatory', group: 'quarter', at: [474, 306], guide: '/after/guide/' },
  { id: 'quarter/chronicle', url: '/chronicle/', md: '/md/chronicle.md', title: 'The Chronicle', group: 'quarter', at: [458, 396] },
  { id: 'switchboard/fungi', url: '/fungi/', md: '/md/fungi.md', title: 'Under the Floor', group: 'floor', at: [232, 350] },
  { id: 'switchboard/fungi-i', url: '/fungi/i/', md: '/md/fungi-i.md', title: 'De barathro cretaceo et novicio curioso', short: 'I · De barathro cretaceo', lang: 'la', group: 'floor', on: 'switchboard/fungi' },
  { id: 'switchboard/fungi-ii', url: '/fungi/ii/', md: '/md/fungi-ii.md', title: '60 Hertz', short: 'II · 60 Hertz', group: 'floor', on: 'switchboard/fungi', inspect: '/fungi/field.mjs' },
  { id: 'switchboard/fungi-iii', url: '/fungi/iii/', md: '/md/fungi-iii.md', title: 'Cathedralis sine nomine', short: 'III · Cathedralis sine nomine', group: 'floor', on: 'switchboard/fungi', inspect: '/fungi/vault.mjs' },
  { id: 'math/aksara', url: '/math/aksara/', md: '/md/aksara.md', title: 'Akṣara', group: 'math', at: [308, 254] },
  { id: 'math/super-saiyan', url: '/math/super-saiyan/', md: '/md/super-saiyan.md', title: 'Super Saiyan', group: 'math', at: [315, 202] },
  { id: 'math/wen-liu-ji', url: '/math/wen-liu-ji/', md: '/md/wen-liu-ji.md', title: '西湖第二蹤 · 問流記', group: 'math', at: [322, 154] },
  { id: 'math/spore', url: '/math/spore/', md: '/md/spore.md', title: 'The Spore and the Witness', group: 'math', at: [329, 107] },
  { id: 'math/siddhi', url: '/math/siddhi/', md: '/md/siddhi.md', title: 'I Am the Vast Field · Siddhi', group: 'math', at: [336, 61] },
  { id: 'math/condiciones-del-siddhi', url: '/math/condiciones-del-siddhi/', md: '/md/condiciones-del-siddhi.md', title: 'Sobre las condiciones del siddhi', lang: 'es', group: 'math', at: [386, 49] },
  { id: 'math/vipulaksetra-vratam', url: '/math/vipulaksetra-vratam/', md: '/md/vipulaksetra-vratam.md', title: 'विपुलक्षेत्रव्रतम्', lang: 'sa', group: 'math', at: [302, 102] },
  { id: 'math/nullus-est-cultus', url: '/math/nullus-est-cultus/', md: '/md/nullus-est-cultus.md', title: 'Nullus est cultus', lang: 'la', group: 'math', at: [404, 99] },
  { id: 'coast/rekha', url: '/rekha/', md: '/md/rekha.md', title: 'रेखादेवी', lang: 'sa', group: 'coast', at: [300, 62] },
  { id: 'coast/laksita', url: '/laksita/', md: '/md/laksita.md', title: 'लक्षिता', lang: 'sa', group: 'coast', at: [198, 92] },
  { id: 'sky/akasha', url: '/akasha/', md: '/md/akasha.md', title: 'आकाशगीतम्', lang: 'sa', group: 'sky', at: [112, 34] },
  { id: 'sky/yun', url: '/yun/', md: '/md/yun.md', title: '五行山', lang: 'zh', group: 'sky', at: [470, 30] },
  { id: 'workshop/bells', url: '/bells/', md: '/md/bells.md', title: 'Five bells', group: 'workshop', at: [515, 325] },
  { id: 'quarter/chair', url: '/chair/', md: '/md/chair.md', title: 'A Room with an Empty Chair', short: 'An empty chair', group: 'clearing', at: [400, 306] },
  { id: 'quarter/atlas', url: '/atlas/', md: '/md/index.md', title: 'City atlas', group: 'map', listed: false },
  { id: 'city/lost', url: '/404', title: 'Galileo is sleeping', group: 'map', listed: false },
);

door('house/1', 'house/uppu', 'continue');
door('house/uppu', 'house/1', 'return', { label: 'யாராவது வீட்டில் இருக்கிறார்களா?' });

// The front door also opens straight onto the rest of the city.
for (const to of ['workshop/feather-breeze', 'workshop/vel', 'workshop/kami', 'workshop/rooster', 'workshop/machines', 'switchboard/fungi', 'tavern/rumor', 'quarter/threshold', 'quarter/chair']) door('surface/1', to);

door('surface/2', 'workshop/feather-breeze'); door('workshop/feather-breeze', 'surface/2');
door('workshop/feather-breeze', 'surface/1');
door('workshop/feather-breeze', 'workshop/feather');
door('workshop/feather', 'workshop/feather-breeze', 'return');
door('workshop/feather-breeze', 'workshop/minuguru');
door('workshop/minuguru', 'workshop/feather-breeze', 'return');
door('workshop/minuguru', 'switchboard/fungi-ii');
door('workshop/feather', 'workshop/machines'); door('workshop/feather', 'quarter/chair');
door('workshop/feather-breeze', 'workshop/machines'); door('workshop/machines', 'workshop/feather-breeze');
door('workshop/feather-breeze', 'quarter/chair'); door('quarter/chair', 'workshop/feather-breeze');
door('workshop/vel', 'workshop/feather-breeze'); door('workshop/feather-breeze', 'workshop/vel');
door('workshop/vel', 'switchboard/fungi-ii'); door('switchboard/fungi-ii', 'workshop/vel');
door('workshop/vel', 'quarter/chair');
door('workshop/rooster', 'workshop/vel'); door('workshop/vel', 'workshop/rooster');
door('workshop/rooster', 'workshop/feather-breeze'); door('workshop/feather-breeze', 'workshop/rooster');
door('workshop/rooster', 'switchboard/fungi-ii');
door('workshop/kami', 'workshop/vel'); door('workshop/vel', 'workshop/kami');
door('workshop/kami', 'workshop/rooster'); door('workshop/rooster', 'workshop/kami');
door('workshop/kami', 'switchboard/fungi-i');
door('workshop/machines', 'switchboard/fungi-ii'); door('switchboard/fungi-ii', 'workshop/machines');
door('workshop/machines', 'quarter/threshold');
door('sky/yun', 'workshop/machines'); door('workshop/machines', 'sky/yun');
door('sky/yun', 'switchboard/fungi');
door('coast/rekha', 'workshop/minuguru'); door('coast/rekha', 'sky/yun'); door('coast/rekha', 'switchboard/fungi'); door('coast/rekha', 'workshop/bells');
door('coast/rekha', 'coast/laksita'); door('coast/laksita', 'sky/akasha'); door('coast/laksita', 'coast/rekha');
door('sky/akasha', 'coast/rekha'); door('sky/akasha', 'coast/laksita'); door('sky/akasha', 'switchboard/fungi'); door('sky/akasha', 'workshop/bells');
door('workshop/bells', 'coast/rekha'); door('sky/yun', 'coast/rekha'); door('workshop/machines', 'quarter/chair');

door('tavern/rumor', 'quarter/conservatory'); door('quarter/conservatory', 'tavern/rumor');
door('tavern/rumor', 'beyond/kfc', 'continue', { access: 'conditional' });
door('beyond/kfc', 'tavern/rumor', 'return'); door('beyond/kfc', 'quarter/threshold');
door('beyond/kfc', 'beyond/ultra', 'continue');
door('beyond/ultra', 'beyond/kfc', 'return');
door('beyond/ultra', 'quarter/chair');

door('quarter/threshold', 'quarter/conservatory'); door('quarter/threshold', 'quarter/chronicle');
door('quarter/threshold', 'quarter/chair'); door('quarter/threshold', 'workshop/machines');
door('quarter/threshold', 'switchboard/fungi-iii');
door('quarter/conservatory', 'quarter/threshold'); door('quarter/conservatory', 'quarter/chronicle');
door('quarter/chronicle', 'quarter/conservatory'); door('quarter/chronicle', 'quarter/threshold');
door('quarter/chair', 'quarter/conservatory');
door('quarter/chair', 'workshop/bells'); door('workshop/bells', 'quarter/chair');

door('switchboard/fungi', 'switchboard/fungi-i', 'continue');
door('switchboard/fungi', 'switchboard/fungi-ii'); door('switchboard/fungi', 'switchboard/fungi-iii');
door('switchboard/fungi', 'surface/1');
door('switchboard/fungi-i', 'switchboard/fungi-ii', 'continue');
door('switchboard/fungi-i', 'switchboard/fungi', 'return');
door('switchboard/fungi-ii', 'switchboard/fungi-iii', 'continue');
door('switchboard/fungi-ii', 'switchboard/fungi-i', 'return');
door('switchboard/fungi-iii', 'quarter/threshold', 'side', { label: 'per rimam' });
door('switchboard/fungi-iii', 'switchboard/fungi-i', 'return');
door('switchboard/fungi-iii', 'switchboard/fungi-ii', 'return');
door('switchboard/fungi-iii', 'quarter/chair');

for (const to of ['surface/1', 'surface/2', 'surface/3', 'surface/4', 'surface/5', 'surface/6']) door('city/lost', to);

door('math/siddhi', 'math/vipulaksetra-vratam');
door('math/vipulaksetra-vratam', 'math/siddhi');
const mathematics = ['math/aksara', 'math/super-saiyan', 'math/wen-liu-ji', 'math/spore', 'math/siddhi', 'math/condiciones-del-siddhi', 'math/nullus-est-cultus', 'math/vipulaksetra-vratam'];
sequences.push({ id: 'mathematics', rooms: mathematics });
for (const [i, id] of mathematics.entries()) {
  if (i === 0) continue;
  door(mathematics[i - 1], id, 'continue');
  door(id, mathematics[i - 1], 'return');
}
for (const neighbor of ['archive/2', 'switchboard/fungi-ii']) {
  door(neighbor, 'math/aksara');
  door('math/aksara', neighbor);
}

sequences.push({ id: 'under-the-floor', rooms: ['switchboard/fungi-i', 'switchboard/fungi-ii', 'switchboard/fungi-iii'], loops: true });

export default {
  schema: 2,
  note: 'Where the doors are.',
  groups: [
    { id: 'six', title: 'Six Doors' },
    { id: 'workshop', title: 'Workshop' },
    { id: 'tavern', title: 'Tavern' },
    { id: 'quarter', title: 'Unfinished Quarter' },
    { id: 'math', title: 'Mathematics' },
    { id: 'floor', title: 'Under the Floor' },
    { id: 'clearing', title: 'Clearing' },
    { id: 'sky', title: 'Sky' },
    { id: 'coast', title: 'Coast' },
  ],
  rooms, doors, sequences,
  unbuilt: ['The chalk porch', 'A dock without a boat', 'The night stall', 'The relay', 'The spore dispensary'],
  sketch: { porch: [78, 308], dock: [400, 584] },
};
