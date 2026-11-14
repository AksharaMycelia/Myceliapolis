// Room I. One thread grows as far as you have read. One held note, if asked for.
import { voices } from '../tone.mjs';
const thread = document.getElementById('thread');
const text = document.querySelector('.libretto');
function grow() {
  const box = text.getBoundingClientRect();
  const read = Math.min(1, Math.max(0.02, (innerHeight * 0.7 - box.top) / box.height));
  thread.style.height = (read * 100) + '%';
  thread.style.setProperty('--tip', '100%');
}
addEventListener('scroll', grow, { passive: true }); addEventListener('resize', grow); grow();
// The seventh of the scale: the note that most wants to go home, held alone.
const sound = voices(document.getElementById('sound'), [493.88]);
document.getElementById('sound').addEventListener('click', () => setTimeout(() => sound.set([0.8]), 30));
