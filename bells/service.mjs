// The browser keeps its random key. Only a digest goes into the score.
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const numberIn = (value, max) => Number.isInteger(value) && value >= 0 && value <= max;
const send = (data, status = 200) => Response.json(data, {status, headers: {'Cache-Control':'no-store'}});
function valid(notes, count) {
  return Array.isArray(notes) && notes.length === count && notes.every((n,i) =>
    Array.isArray(n) && n.length === 2 && numberIn(n[0],4) && numberIn(n[1],120000)
    && (!i || n[1] >= notes[i-1][1]));
}
function score(row) {
  const notes = JSON.parse(row.notes);
  if (row.tone !== null) notes.push([row.tone, notes[3][1] + row.delay]);
  return {id:row.id, notes};
}
export async function bellRequest(request, db) {
  const url = new URL(request.url);
  const key = request.headers.get('X-Bell-Key') || '';
  if (!uuid.test(key)) return send({error:'This room needs a visitor key.'},400);
  const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));
  const player = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2,'0')).join('');
  await db.prepare(`CREATE TABLE IF NOT EXISTS bell_scores (
    id TEXT PRIMARY KEY, player TEXT UNIQUE NOT NULL, notes TEXT NOT NULL,
    tone INTEGER, delay INTEGER, respondent TEXT)`).run();
  const own = () => db.prepare('SELECT * FROM bell_scores WHERE player=?').bind(player).first();
  if (request.method === 'GET') {
    const row = url.searchParams.has('listen')
      ? await db.prepare('SELECT * FROM bell_scores WHERE player<>? AND tone IS NULL ORDER BY rowid LIMIT 1').bind(player).first()
      : await own();
    return send(row ? score(row) : null);
  }
  if (request.method !== 'POST') return send({error:'Use GET or POST.'},405);
  if (!request.headers.get('Content-Type')?.startsWith('application/json') ||
      request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) return send({error:'Invalid request.'},400);
  const reader = request.body?.getReader();
  let body = '', size = 0;
  if (reader) for (;;) {
    const {done,value} = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 1024) { await reader.cancel(); return send({error:'Score too large.'},413); }
    body += new TextDecoder().decode(value);
  }
  let data;
  try { data = JSON.parse(body); } catch { return send({error:'Invalid score.'},400); }
  if (!data || !valid(data.notes, data.id ? 1 : 4)) return send({error:'Invalid notes.'},400);
  if (!data.id) {
    if (data.notes[0][1] !== 0) return send({error:'Start on the first bell.'},400);
    await db.prepare(`INSERT OR IGNORE INTO bell_scores(id,player,notes)
      SELECT ?,?,? WHERE (SELECT COUNT(*) FROM bell_scores)<10000`).bind(crypto.randomUUID(),player,JSON.stringify(data.notes)).run();
    const row = await own();
    return row ? send(score(row)) : send({error:'The room is full.'},429);
  }
  if (!uuid.test(data.id)) return send({error:'Unknown score.'},400);
  const [[tone,delay]] = data.notes;
  await db.prepare('UPDATE bell_scores SET tone=?,delay=?,respondent=? WHERE id=? AND tone IS NULL AND player<>?')
    .bind(tone,delay,player,data.id,player).run();
  const row = await db.prepare('SELECT * FROM bell_scores WHERE id=?').bind(data.id).first();
  return row?.respondent === player ? send(score(row)) : send({error:'Someone else reached this bell first.'},409);
}
