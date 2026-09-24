// Nocturne renderer: library, playback, synced lyrics and a 3D audio visualiser.
import * as THREE from './vendor/three.module.min.js';
import { readTags, parseLRC } from './id3.js';

const $ = (s) => document.querySelector(s);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
const store = { get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

/* ---------------- Library ---------------- */
const DEFAULT = {
  id: 'default',
  title: 'Falls Through Walls (80s edit)',
  artist: 'Kaer Trouz · remix by dotjot',
  url: 'assets/falls-through-walls.mp3',
  cover: 'assets/falls-cover.jpg',
  lrcUrl: 'assets/falls-through-walls.lrc',
  colors: ['#ff4fa0', '#7ad7ff'],
  credit: 'CC BY 3.0 · <a href="https://ccmixter.org/files/dotjot/67669" target="_blank" rel="noopener">dotjot</a>, vocals and lyrics <a href="https://ccmixter.org/files/Kaer_Trouz/14388" target="_blank" rel="noopener">Kaer Trouz</a> · cover art: Nocturne',
};
const tracks = [DEFAULT];
let current = 0, shuffle = false, repeat = 'all';   // repeat: off | all | one

const audio = $('#audio');
audio.volume = +store.get('nocturne-vol', 80) / 100;
$('#volume').value = Math.round(audio.volume * 100);

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a1f6b"/><stop offset="1" stop-color="#0d3b5c"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><circle cx="50" cy="50" r="18" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/><circle cx="50" cy="50" r="4" fill="#fff" fill-opacity=".6"/></svg>`);

function renderList() {
  $('#list').innerHTML = tracks.map((t, i) => `
    <li><button data-i="${i}" aria-current="${i === current}">
      <img src="${t.cover || PLACEHOLDER}" alt="">
      <span><span class="t">${esc(t.title)}</span><span class="a">${esc(t.artist || 'Unknown artist')}</span></span>
      <span class="d">${t.duration ? fmt(t.duration) : ''}</span><span class="eq"><i></i><i></i><i></i></span>
    </button></li>`).join('');
  document.body.classList.toggle('paused', audio.paused);
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
$('#list').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) load(+b.dataset.i, true); });

/* Import files: audio + optional .lrc with the same base name */
async function addFiles(fileList) {
  const files = [...fileList];
  const lrcs = new Map(files.filter((f) => /\.lrc$/i.test(f.name)).map((f) => [base(f.name), f]));
  const audioFiles = files.filter((f) => f.type.startsWith('audio/') || /\.(mp3|m4a|aac|flac|wav|ogg|opus)$/i.test(f.name));
  const firstNew = tracks.length;
  for (const f of audioFiles) {
    const tags = await readTags(f).catch(() => ({}));
    const t = { id: crypto.randomUUID(), title: tags.title || base(f.name), artist: tags.artist || '', url: URL.createObjectURL(f), cover: tags.cover || '', lyricsText: tags.lyrics || '', lrcFile: lrcs.get(base(f.name)) };
    tracks.push(t);
    probeDuration(t);
  }
  renderList();
  if (audioFiles.length) load(firstNew, true);
}
const base = (n) => n.replace(/^.*[\\/]/, '').replace(/\.[^.]+$/, '');
function probeDuration(t) { const a = new Audio(); a.preload = 'metadata'; a.src = t.url; a.onloadedmetadata = () => { t.duration = a.duration; renderList(); }; }

$('#addFiles').addEventListener('click', () => $('#fileInput').click());
$('#addFolder').addEventListener('click', () => $('#folderInput').click());
$('#fileInput').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
$('#folderInput').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
let dragDepth = 0;
addEventListener('dragenter', (e) => { if (e.dataTransfer?.types?.includes('Files')) { dragDepth++; document.body.classList.add('dragging'); } });
addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; document.body.classList.remove('dragging'); } });
addEventListener('dragover', (e) => e.preventDefault());
addEventListener('drop', (e) => { e.preventDefault(); dragDepth = 0; document.body.classList.remove('dragging'); if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files); });

/* ---------------- Playback ---------------- */
let lyrics = [];
async function load(i, autoplay = false) {
  current = (i + tracks.length) % tracks.length;
  const t = tracks[current];
  audio.src = t.url;
  $('#title').textContent = t.title; $('#artist').textContent = t.artist || 'Unknown artist';
  $('#miniTitle').textContent = t.title; $('#miniArtist').textContent = t.artist || '';
  $('#credit').innerHTML = t.credit || '';
  const cover = t.cover || PLACEHOLDER;
  ['#cover', '#coverGlow', '#miniCover'].forEach((s) => ($(s).src = cover));
  document.title = `${t.title} · Nocturne`;
  if (t.colors) setColors(...t.colors); else pickColors(cover);
  renderList();
  // lyrics
  lyrics = [];
  try {
    if (t.lrcUrl) lyrics = parseLRC(await (await fetch(t.lrcUrl)).text());
    else if (t.lrcFile) lyrics = parseLRC(await t.lrcFile.text());
  } catch {}
  renderLyrics(t);
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist, artwork: [{ src: new URL(cover, location.href).href, sizes: '512x512' }] });
  }
  if (autoplay) play();
}

async function play() { ensureAudioGraph(); try { await audio.play(); } catch {} }
const toggle = () => (audio.paused ? play() : audio.pause());
const nextIndex = (dir) => shuffle && tracks.length > 2 ? (current + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length : current + dir;
const next = () => load(nextIndex(1), true);
const prev = () => (audio.currentTime > 3 ? (audio.currentTime = 0) : load(nextIndex(-1), true));

audio.addEventListener('play', () => { setPlayIcon(true); renderList(); });
audio.addEventListener('pause', () => { setPlayIcon(false); document.body.classList.add('paused'); });
audio.addEventListener('ended', () => {
  if (repeat === 'one') { audio.currentTime = 0; play(); }
  else if (current < tracks.length - 1 || repeat === 'all' || shuffle) next();
});
audio.addEventListener('loadedmetadata', () => { $('#dur').textContent = fmt(audio.duration); tracks[current].duration = audio.duration; });
function setPlayIcon(playing) {
  $('#playIcon').innerHTML = playing ? '<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>' : '<path d="M7 4v16l13-8z"/>';
  $('#play').setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

$('#play').addEventListener('click', toggle);
$('#next').addEventListener('click', next);
$('#prev').addEventListener('click', prev);
$('#shuffle').addEventListener('click', (e) => { shuffle = !shuffle; e.currentTarget.setAttribute('aria-pressed', String(shuffle)); });
$('#repeat').addEventListener('click', (e) => {
  repeat = repeat === 'all' ? 'one' : repeat === 'one' ? 'off' : 'all';
  e.currentTarget.setAttribute('aria-pressed', String(repeat !== 'off'));
  e.currentTarget.title = { all: 'Repeat all', one: 'Repeat one', off: 'Repeat off' }[repeat];
  e.currentTarget.style.position = 'relative';
  e.currentTarget.dataset.one = repeat === 'one' ? '1' : '';
});
$('#repeat').setAttribute('aria-pressed', 'true'); $('#repeat').title = 'Repeat all';

const progress = $('#progress');
let seeking = false;
progress.addEventListener('input', () => { seeking = true; paintRange(progress, progress.value / 10); $('#cur').textContent = fmt((progress.value / 1000) * audio.duration); });
progress.addEventListener('change', () => { audio.currentTime = (progress.value / 1000) * audio.duration; seeking = false; });
$('#volume').addEventListener('input', (e) => { audio.volume = e.target.value / 100; store.set('nocturne-vol', e.target.value); paintRange(e.target, e.target.value); });
const paintRange = (el, pct) => el.style.setProperty('--p', `${pct}%`);
paintRange($('#volume'), $('#volume').value);

$('#lyricsBtn').addEventListener('click', (e) => {
  const on = $('.stage').classList.toggle('no-lyrics') === false;
  e.currentTarget.setAttribute('aria-pressed', String(on));
});

addEventListener('keydown', (e) => {
  if (e.target.closest('input[type=text]')) return;
  if (e.code === 'Space') { e.preventDefault(); toggle(); }
  else if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
  else if (e.key === 'ArrowLeft' && !e.metaKey && !e.ctrlKey) audio.currentTime = Math.max(0, audio.currentTime - 5);
  else if (e.key === 'ArrowUp') { e.preventDefault(); audio.volume = Math.min(1, audio.volume + .05); $('#volume').value = audio.volume * 100; paintRange($('#volume'), audio.volume * 100); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); audio.volume = Math.max(0, audio.volume - .05); $('#volume').value = audio.volume * 100; paintRange($('#volume'), audio.volume * 100); }
  else if (e.key.toLowerCase() === 'l') $('#lyricsBtn').click();
});
if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', play);
  navigator.mediaSession.setActionHandler('pause', () => audio.pause());
  navigator.mediaSession.setActionHandler('nexttrack', next);
  navigator.mediaSession.setActionHandler('previoustrack', prev);
}
window.nocturne?.onMenu((ch) => ({ add: () => $('#fileInput').click(), folder: () => $('#folderInput').click(), toggle, next, prev, lyrics: () => $('#lyricsBtn').click() }[ch]?.()));

/* ---------------- Lyrics ---------------- */
let lyricIndex = -1;
function renderLyrics(t) {
  const box = $('#lyrics');
  lyricIndex = -1;
  if (lyrics.length) {
    box.innerHTML = lyrics.map((l, i) => l.text ? `<p data-i="${i}">${esc(l.text)}</p>` : `<p data-i="${i}" class="gap"><span>•</span> <span>•</span> <span>•</span></p>`).join('');
  } else if (t.lyricsText) {
    box.innerHTML = t.lyricsText.split(/\n+/).map((l) => `<p class="past">${esc(l)}</p>`).join('');
  } else {
    box.innerHTML = `<p class="empty">No lyrics for this track. Drop an .lrc file with the same name to see synced lyrics.</p>`;
  }
  box.style.transform = 'translateY(0)';
}
$('#lyrics').addEventListener('click', (e) => { const p = e.target.closest('p[data-i]'); if (p) { audio.currentTime = lyrics[+p.dataset.i].t + .01; play(); } });

function syncLyrics(time) {
  if (!lyrics.length) return;
  let i = -1;
  for (let k = 0; k < lyrics.length; k++) { if (lyrics[k].t <= time + .15) i = k; else break; }
  if (i === lyricIndex) return;
  lyricIndex = i;
  const ps = $('#lyrics').children;
  for (let k = 0; k < ps.length; k++) { ps[k].classList.toggle('on', k === i); ps[k].classList.toggle('past', k < i); }
  const el = ps[Math.max(0, i)], panel = $('#lyricsPanel');
  if (el) $('#lyrics').style.transform = `translateY(${-(el.offsetTop - panel.clientHeight * .38)}px)`;
}

/* ---------------- Colours from the cover ---------------- */
const accent = new THREE.Color('#ff4fa0'), accent2 = new THREE.Color('#7ad7ff');
function setColors(a, b) {
  accent.set(a); accent2.set(b);
  document.documentElement.style.setProperty('--accent', a);
  document.documentElement.style.setProperty('--accent2', b);
}
function pickColors(src) {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, 32, 32);
    const d = g.getImageData(0, 0, 32, 32).data, cands = [];
    for (let i = 0; i < d.length; i += 4) {
      const col = new THREE.Color(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255), hsl = {};
      col.getHSL(hsl);
      if (hsl.s > .5 && hsl.l > .3 && hsl.l < .62) cands.push({ col, hsl, score: hsl.s * hsl.s * (1 - Math.abs(hsl.l - .5) * 2) });
    }
    cands.sort((a, b) => b.score - a.score);
    if (!cands.length) return;
    const a = cands[0], b = cands.find((x) => Math.abs(x.hsl.h - a.hsl.h) > .15) || cands[Math.min(5, cands.length - 1)];
    accent.copy(a.col); accent2.copy(b.col);
    document.documentElement.style.setProperty('--accent', '#' + a.col.clone().offsetHSL(0, .08, 0).getHexString());
    document.documentElement.style.setProperty('--accent2', '#' + b.col.getHexString());
  };
  img.src = src;
}

/* ---------------- Audio analysis ---------------- */
let actx, analyser, freq, wave;
function ensureAudioGraph() {
  if (actx) { actx.resume(); return; }
  actx = new AudioContext();
  const src = actx.createMediaElementSource(audio);
  analyser = actx.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = .8;
  src.connect(analyser); analyser.connect(actx.destination);
  freq = new Uint8Array(analyser.frequencyBinCount); wave = new Uint8Array(analyser.fftSize);
}
const idleFreq = (t, i) => (Math.sin(t * 1.5 + i * .25) * .5 + .5) * 40 * (1 - i / 512);

/* ---------------- 3D visualiser ---------------- */
const canvas = $('#viz');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x07060c);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x07060c, 14, 42);
const camera = new THREE.PerspectiveCamera(55, 1, .1, 100);
camera.position.set(0, 2.6, 11); camera.lookAt(0, 1, 0);

// Circular equaliser: 96 bars on a ring behind the cover
const BARS = 120;
let ringR = 3;   // recalculated so the ring hugs the cover
const barGeo = new THREE.BoxGeometry(1, 1, .02);   // width set per bar barGeo.translate(0, .5, 0);
const barMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false });
const bars = new THREE.InstancedMesh(barGeo, barMat, BARS);
bars.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(BARS * 3), 3);
const ring = new THREE.Group(); ring.add(bars); ring.position.set(0, 1, 0); scene.add(ring);   // faces the camera every frame
const dummy = new THREE.Object3D(), tmpCol = new THREE.Color();

// Mirrored glow disc in the middle
const halo = new THREE.Mesh(new THREE.RingGeometry(.985, 1, 160), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .25, side: THREE.DoubleSide }));
ring.add(halo);

// Scrolling synthwave floor grid
const GRID = 40, gridGeo = new THREE.BufferGeometry();
const gv = [];
for (let i = -GRID; i <= GRID; i += 2) { gv.push(i, 0, -60, i, 0, 20); }
for (let z = -60; z <= 20; z += 2) { gv.push(-GRID, 0, z, GRID, 0, z); }
gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gv, 3));
const gridMat = new THREE.LineBasicMaterial({ color: 0xff4fa0, transparent: true, opacity: .35 });
const grid = new THREE.LineSegments(gridGeo, gridMat); grid.position.y = -3; scene.add(grid);

// Waveform line floating above the floor
const WAVE_N = 256;
const waveGeo = new THREE.BufferGeometry();
waveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(WAVE_N * 3), 3));
const waveLine = new THREE.Line(waveGeo, new THREE.LineBasicMaterial({ color: 0x7ad7ff, transparent: true, opacity: .8 }));
waveLine.position.set(0, -1.6, -2); scene.add(waveLine);

// Dust particles that rush on the beat
const DUST = 900, dustGeo = new THREE.BufferGeometry(), dustPos = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) { dustPos[i * 3] = (Math.random() - .5) * 50; dustPos[i * 3 + 1] = Math.random() * 18 - 3; dustPos[i * 3 + 2] = -Math.random() * 60 + 10; }
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: .06, color: 0xffffff, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending }));
scene.add(dust);

let mode = +store.get('nocturne-mode', 0);   // 0 ring + grid, 1 grid + wave only
$('#modeBtn').addEventListener('click', () => { mode = (mode + 1) % 2; store.set('nocturne-mode', mode); });

// Keep the ring centred behind the cover wherever the layout puts it
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const r = $('#coverWrap').getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  camera.setViewOffset(w, h, (w / 2 - cx), (h / 2 - cy), w, h);
  camera.updateProjectionMatrix();
  // world size of the cover at the ring's distance -> ring radius just outside the cover's corners
  const dist = camera.position.distanceTo(ring.position);
  const worldPerPx = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / h;
  ringR = (r.width / 2) * 1.08 * worldPerPx;
}
addEventListener('resize', resize);
new ResizeObserver(resize).observe($('#coverWrap'));

// Cover tilts toward the pointer
let tiltX = 0, tiltY = 0, tx = 0, ty = 0;
addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; });

const clock = new THREE.Clock();
let bassSmooth = 0;
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  const live = analyser && !audio.paused;
  if (live) { analyser.getByteFrequencyData(freq); analyser.getByteTimeDomainData(wave); }

  // bass energy drives pulses
  let bass = 0; for (let i = 2; i < 12; i++) bass += live ? freq[i] : idleFreq(t, i); bass /= 10 * 255;
  bassSmooth += (bass - bassSmooth) * .2;

  // bars: mirror the low half of the spectrum around the ring
  for (let i = 0; i < BARS; i++) {
    const half = i < BARS / 2 ? i : BARS - 1 - i;
    const bin = Math.floor(Math.pow(half / (BARS / 2), 1.6) * 180) + 2;
    const v = (live ? freq[bin] : idleFreq(t, bin)) / 255;
    const a = (i / BARS) * Math.PI * 2 + Math.PI / 2;
    dummy.position.set(Math.cos(a) * ringR, Math.sin(a) * ringR, 0);
    dummy.rotation.set(0, 0, a - Math.PI / 2);
    dummy.scale.set(ringR * .028, ringR * (.03 + v * v * .42), 1);
    dummy.updateMatrix(); bars.setMatrixAt(i, dummy.matrix);
    tmpCol.copy(accent).lerp(accent2, half / (BARS / 2)).multiplyScalar(.35 + v * 1.1);
    bars.setColorAt(i, tmpCol);
  }
  bars.instanceMatrix.needsUpdate = true; bars.instanceColor.needsUpdate = true;
  bars.visible = halo.visible = mode === 0;
  ring.quaternion.copy(camera.quaternion);
  bars.rotation.z += dt * (RM ? 0 : .05);
  ring.scale.setScalar(1 + bassSmooth * .08);
  halo.scale.setScalar(ringR * 1.01); halo.material.color.copy(accent); halo.material.opacity = .2 + bassSmooth * .6;

  // floor scrolls toward the viewer, faster with bass
  grid.position.z = (grid.position.z + dt * (RM ? 0 : 2 + bassSmooth * 10)) % 2;
  gridMat.color.copy(accent); gridMat.opacity = .22 + bassSmooth * .35;

  // waveform
  const wp = waveGeo.attributes.position.array;
  for (let i = 0; i < WAVE_N; i++) {
    const v = live ? (wave[Math.floor(i / WAVE_N * wave.length)] - 128) / 128 : Math.sin(t * 2 + i * .08) * .05;
    wp[i * 3] = (i / (WAVE_N - 1) - .5) * 30; wp[i * 3 + 1] = v * (mode === 1 ? 3.2 : 1.6); wp[i * 3 + 2] = 0;
  }
  waveGeo.attributes.position.needsUpdate = true;
  waveLine.material.color.copy(accent2);

  // dust drifts forward
  const dp = dustGeo.attributes.position.array, speed = RM ? 0 : (1 + bassSmooth * 14) * dt;
  for (let i = 0; i < DUST; i++) { dp[i * 3 + 2] += speed; if (dp[i * 3 + 2] > 12) dp[i * 3 + 2] = -50; }
  dustGeo.attributes.position.needsUpdate = true;

  // camera sway and cover tilt
  if (!RM) { camera.position.x = Math.sin(t * .15) * .8; camera.position.y = 2.6 + Math.sin(t * .2) * .3; camera.lookAt(0, 1, 0); }
  tiltX += (tx - tiltX) * .08; tiltY += (ty - tiltY) * .08;
  $('#cover').style.transform = `rotateY(${tiltX * 10}deg) rotateX(${-tiltY * 10}deg) scale(${1 + bassSmooth * .04})`;
  document.documentElement.style.setProperty('--pulse', (1 + bassSmooth * .15).toFixed(3));

  // progress + lyrics
  if (!seeking && isFinite(audio.duration)) {
    const pct = audio.currentTime / audio.duration * 100;
    progress.value = pct * 10; paintRange(progress, pct);
    $('#cur').textContent = fmt(audio.currentTime);
  }
  syncLyrics(audio.currentTime);
  renderer.render(scene, camera);
}

/* ---------------- Demo notice ---------------- */
const demo = $('#demo'), demoTab = demo.querySelector('.demo-tab');
demoTab.addEventListener('click', () => demoTab.setAttribute('aria-expanded', String(demo.classList.toggle('open'))));

/* ---------------- Boot ---------------- */
resize();
load(0);
frame();
