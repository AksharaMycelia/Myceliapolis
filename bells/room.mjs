const byId = id => document.getElementById(id);
const bells = [...document.querySelectorAll('.bell')];
const labels = bells.map(b => b.textContent);
const pitches = [196, 233.08, 261.63, 293.66, 392];
let audio, key, upstairs = false, busy = false, playing = false;
let mode = 'write', notes = [], stranger, started, lastHeard, answer;
let timers = [];
try {
  key = localStorage.getItem('five-bells-key') || crypto.randomUUID();
  localStorage.setItem('five-bells-key',key);
} catch { key = null; }

function render(message) {
  if (message) byId('line').textContent = message;
  byId('score').textContent = notes.map(([pitch]) => labels[pitch]).join(' · ');
  bells.forEach(b => b.disabled = busy || playing || (mode === 'write' && notes.length === 4) || mode === 'saved' || mode === 'offer');
  byId('play').disabled = busy || playing || !notes.length;
  byId('leave').hidden = !(mode === 'write' && notes.length === 4 || mode === 'offer');
  byId('leave').textContent = mode === 'offer' ? 'Leave the fifth note' : 'Leave these four';
  byId('undo').hidden = mode !== 'write' || !notes.length;
  for (const id of ['leave','undo','other','mine']) byId(id).disabled = busy || playing;
}
async function api(method, data, query='') {
  if (!key) throw Error('Enable browser storage to share these bells.');
  const res = await fetch('/api/bells/'+query,{method,headers:{'X-Bell-Key':key,'Content-Type':'application/json'},body:data && JSON.stringify(data)});
  if (!res.ok) {
    if (res.status === 409) throw Error('Another visitor left a fifth note. Try another stranger.');
    throw Error('The bells could not reach the city. You can try again.');
  }
  return res.json();
}
async function work(fn) {
  if (busy || playing) return;
  busy = true; render();
  try { await fn(); } catch(e) { render(e.message); }
  finally { busy = false; render(); }
}
function wake() {
  audio ||= new (window.AudioContext || window.webkitAudioContext)();
  return audio.resume();
}
function partial(hz, volume, duration, delay=0) {
  const start = audio.currentTime + delay, osc = audio.createOscillator(), gain = audio.createGain();
  osc.frequency.value = hz;
  gain.gain.setValueAtTime(.0001,start);
  gain.gain.exponentialRampToValueAtTime(volume,start+.008);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(gain); gain.connect(audio.destination); osc.start(start); osc.stop(start+duration);
  osc.onended = () => {osc.disconnect();gain.disconnect();};
}
function strike(p) {
  const freq = pitches[p];
  partial(freq,upstairs ? .075 : .16,1.7);
  partial(freq*2.71,upstairs ? .005 : .055,.85);
  if (upstairs && p === 0) for (const delay of [.065,.114,.184]) partial(1830,.042,.065,delay);
  bells[p].classList.add('flash');
  setTimeout(()=>bells[p].classList.remove('flash'),220);
}
function playback(arm=false) {
  playing = true; render(arm ? 'Listen. Your turn follows the fourth bell.' : 'Listening…');
  for (const [pitch,ms] of notes) timers.push(setTimeout(()=>strike(pitch),ms));
  timers.push(setTimeout(()=>{
    playing = false; timers=[];
    if (arm) { mode='answer'; lastHeard=performance.now(); }
    render(arm ? 'Ring any bell when you’re ready.' : 'The bells are quiet.');
  },notes.at(-1)[1]));
}
bells.forEach((bell,pitch)=>bell.onclick = ()=>work(async()=>{
  await wake(); strike(pitch);
  const now=performance.now();
  if(mode === 'answer') {
    const wait=Math.round(now-lastHeard);
    if(wait>120000) { playback(true); return; }
    answer=[pitch,wait]; notes.push([pitch,notes[3][1]+wait]);mode='offer';render('Leave this note for the first musician?');return;
  }
  if (!notes.length) started=now;
  const at=Math.round(now-started);
  if(at>120000) {render('This score holds two minutes. Start over to record again.');return;}
  notes.push([pitch,at]);render(notes.length===4?'Four bells. Leave them here for someone?':'Take your time.');
}));
byId('stairs').onclick=()=>{
  upstairs=!upstairs;document.body.classList.toggle('upstairs',upstairs);
  byId('stairs').setAttribute('aria-pressed',String(upstairs));
  byId('stairs').textContent=upstairs?'Come downstairs ↓':'Go upstairs ↑';
};
byId('play').onclick=()=>work(async()=>{await wake();playback(mode==='answer');});
byId('undo').onclick=()=>{notes=[];render('Ring four notes. Leave the pauses in.');};
byId('leave').onclick=()=>work(async()=>{
  const row=await api('POST',mode==='offer'?{id:stranger,notes:[answer]}:{notes});
  mode='saved'; notes=row.notes; render(notes.length===5?'Five notes are waiting here.':'Your four notes are here. Come back on this browser to hear the fifth.');
});
byId('other').onclick=()=>work(async()=>{
  await wake();
  const row=await api('GET',undefined,'?listen');
  if(!row) {render('No unanswered bells from another visitor yet.');return;}
  stranger=row.id;mode='answer';notes=row.notes;playback(true);
});
async function mine(){
  const row=await api('GET');
  if(row){mode='saved';notes=row.notes;render(notes.length===5?'Someone has left you a fifth note.':'Your four bells are still waiting.');}
  else {mode='write';notes=[];render('Ring four notes. Leave the pauses in.');}
}
byId('mine').onclick=()=>work(mine);
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden || !playing) return;
  timers.forEach(clearTimeout);timers=[];playing=false;
  if(mode==='answer') lastHeard=-Infinity;
  render('Playback paused. Listen again when you return.');
});
if(key) work(mine); else render('You can play here. Sharing needs browser storage.');
