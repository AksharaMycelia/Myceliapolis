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
    { id: `surface/${n}`, url, md: `/md/p${n}.md`, title, group: 'six', role: 'poem', at, ...(mark ? { mark } : {}) },
    { id: `archive/${n}`, url: `/${paper}/`, md: `/md/a${n}.md`, title: paperTitle, group: 'six', role: 'paper', on: `surface/${n}` },
    { id: `archive/${n}/wrong`, url: `/${paper}/wrong/`, title: 'Wrong room', group: 'six', role: 'return room', listed: false, on: `surface/${n}` },
    { id: `house/${n}`, url: `/o/${key}/`, md: `/md/o${n}.md`, title: opera, lang: 'it', group: 'six', role: 'opera', on: `surface/${n}` },
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
  { id: 'workshop/feather-breeze', url: '/feather/breeze/', md: '/md/feather-breeze.md', title: 'மயிலிறகு', lang: 'ta', group: 'workshop', at: [692, 190], inspect: '/feather/breeze/temper.mjs', keeps: 'nothing; habits last while the page is open' },
  { id: 'workshop/feather', url: '/feather/first/', md: '/md/feather.md', title: 'One Feather', group: 'workshop', access: 'secondary', on: 'workshop/feather-breeze', inspect: '/feather/optics.mjs', keeps: 'nothing' },
  { id: 'workshop/machines', url: '/machines/', md: '/md/machines.md', title: 'Small Machines', group: 'workshop', at: [704, 350], inspect: '/machines/engine.mjs', keeps: 'nothing on the server; a snapshot travels in the address fragment' },
  { id: 'tavern/rumor', url: '/rumor/', md: '/md/rumor.md', title: 'Taberna rumorum', lang: 'la', group: 'tavern', at: [246, 262], guide: '/participate.md', keeps: 'a rumor, when one is given' },
  { id: 'beyond/kfc', url: '/kfc/', md: '/md/kfc.md', title: 'Semen Rubiconis KFC', lang: 'la', group: 'tavern', access: 'conditional', condition: 'opens after a rumor has been exchanged in the tavern', on: 'tavern/rumor' },
  { id: 'quarter/threshold', url: '/after/', md: '/md/after.md', title: 'The Unfinished Quarter', group: 'quarter', at: [440, 222], guide: '/after/guide/' },
  { id: 'quarter/conservatory', url: '/conservatory/', md: '/md/conservatory.md', title: 'The Conservatory of Unfinished Sentences', short: 'The Conservatory', group: 'quarter', at: [474, 306], guide: '/after/guide/', keeps: 'a beginning or a response, when one is left' },
  { id: 'quarter/chronicle', url: '/chronicle/', md: '/md/chronicle.md', title: 'The Chronicle', group: 'quarter', at: [458, 396] },
  { id: 'switchboard/fungi', url: '/fungi/', md: '/md/fungi.md', title: 'Under the Floor', group: 'floor', at: [232, 350] },
  { id: 'switchboard/fungi-i', url: '/fungi/i/', md: '/md/fungi-i.md', title: 'De barathro cretaceo et novicio curioso', short: 'I · De barathro cretaceo', lang: 'la', group: 'floor', on: 'switchboard/fungi' },
  { id: 'switchboard/fungi-ii', url: '/fungi/ii/', md: '/md/fungi-ii.md', title: '60 Hertz', short: 'II · 60 Hertz', group: 'floor', on: 'switchboard/fungi', inspect: '/fungi/field.mjs', keeps: 'nothing' },
  { id: 'switchboard/fungi-iii', url: '/fungi/iii/', md: '/md/fungi-iii.md', title: 'Cathedralis sine nomine', short: 'III · Cathedralis sine nomine', group: 'floor', on: 'switchboard/fungi', inspect: '/fungi/vault.mjs', keeps: 'nothing' },
  { id: 'quarter/chair', url: '/chair/', md: '/md/chair.md', title: 'A Room with an Empty Chair', short: 'An empty chair', group: 'clearing', at: [400, 306] },
  { id: 'quarter/atlas', url: '/atlas/', md: '/md/index.md', title: 'City atlas', group: 'map', listed: false },
  { id: 'city/lost', url: '/404', title: 'Galileo is sleeping', group: 'map', listed: false },
);

// The front door also opens straight onto the rest of the city.
for (const to of ['workshop/feather-breeze', 'workshop/machines', 'switchboard/fungi', 'tavern/rumor', 'quarter/threshold', 'quarter/chair']) door('surface/1', to);

door('surface/2', 'workshop/feather-breeze'); door('workshop/feather-breeze', 'surface/2');
door('workshop/feather-breeze', 'surface/1');
door('workshop/feather-breeze', 'workshop/feather');
door('workshop/feather', 'workshop/feather-breeze', 'return');
door('workshop/feather', 'workshop/machines'); door('workshop/feather', 'quarter/chair');
door('workshop/feather-breeze', 'workshop/machines'); door('workshop/machines', 'workshop/feather-breeze');
door('workshop/feather-breeze', 'quarter/chair'); door('quarter/chair', 'workshop/feather-breeze');
door('workshop/machines', 'switchboard/fungi-ii'); door('switchboard/fungi-ii', 'workshop/machines');
door('workshop/machines', 'quarter/threshold'); door('workshop/machines', 'quarter/chair');

door('tavern/rumor', 'quarter/conservatory'); door('quarter/conservatory', 'tavern/rumor');
door('tavern/rumor', 'beyond/kfc', 'continue', { access: 'conditional' });
door('beyond/kfc', 'tavern/rumor', 'return'); door('beyond/kfc', 'quarter/threshold');

door('quarter/threshold', 'quarter/conservatory'); door('quarter/threshold', 'quarter/chronicle');
door('quarter/threshold', 'quarter/chair'); door('quarter/threshold', 'workshop/machines');
door('quarter/threshold', 'switchboard/fungi-iii');
door('quarter/conservatory', 'quarter/threshold'); door('quarter/conservatory', 'quarter/chronicle');
door('quarter/chronicle', 'quarter/conservatory'); door('quarter/chronicle', 'quarter/threshold');
door('quarter/chair', 'quarter/conservatory');

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

sequences.push({ id: 'under-the-floor', rooms: ['switchboard/fungi-i', 'switchboard/fungi-ii', 'switchboard/fungi-iii'], loops: true });

export default {
  schema: 2,
  note: 'Where the doors are. A door is a fact about addresses, not a reading of the rooms on either side.',
  groups: [
    { id: 'six', title: 'Six Doors', about: 'Six poems. Under each: a paper, three answers, an opera.' },
    { id: 'workshop', title: 'Workshop', about: 'Things that move when touched.' },
    { id: 'tavern', title: 'Tavern', about: 'Give a rumor. Receive another.' },
    { id: 'quarter', title: 'Unfinished Quarter', about: 'Sentences left for a second voice.' },
    { id: 'floor', title: 'Under the Floor', about: 'Three chambers, a first version.' },
    { id: 'clearing', title: 'Clearing', about: 'A chair. Nothing is asked.' },
  ],
  rooms, doors, sequences,
  unbuilt: ['The chalk porch', 'A dock without a boat', 'The night stall', 'The relay', 'The spore dispensary'],
  sketch: { porch: [78, 308], dock: [400, 584] },
};
