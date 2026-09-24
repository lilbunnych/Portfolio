// Minimal ID3v2 reader: title, artist, album, cover art, unsynced lyrics. Enough for most MP3s.
const dec = (bytes, enc) => {
  const label = enc === 1 || enc === 2 ? 'utf-16' : enc === 3 ? 'utf-8' : 'latin1';
  return new TextDecoder(label).decode(bytes).replace(/\0+$/g, '').replace(/^﻿/, '').trim();
};
const syncsafe = (b, o) => (b[o] << 21) | (b[o + 1] << 14) | (b[o + 2] << 7) | b[o + 3];

export async function readTags(file) {
  const out = {};
  const head = new Uint8Array(await file.slice(0, 10).arrayBuffer());
  if (head[0] !== 0x49 || head[1] !== 0x44 || head[2] !== 0x33) return out; // "ID3"
  const ver = head[3], size = syncsafe(head, 6);
  const b = new Uint8Array(await file.slice(10, 10 + size).arrayBuffer());
  let p = 0;
  while (p + 10 < b.length) {
    const id = String.fromCharCode(b[p], b[p + 1], b[p + 2], b[p + 3]);
    if (!/^[A-Z0-9]{4}$/.test(id)) break;
    const len = ver === 4 ? syncsafe(b, p + 4) : (b[p + 4] << 24) | (b[p + 5] << 16) | (b[p + 6] << 8) | b[p + 7];
    const data = b.subarray(p + 10, p + 10 + len);
    p += 10 + len;
    const enc = data[0];
    if (id === 'TIT2') out.title = dec(data.subarray(1), enc);
    else if (id === 'TPE1') out.artist = dec(data.subarray(1), enc);
    else if (id === 'TALB') out.album = dec(data.subarray(1), enc);
    else if (id === 'APIC' && !out.cover) {
      let i = 1; while (data[i] !== 0) i++;
      const mime = dec(data.subarray(1, i), 0) || 'image/jpeg';
      i += 2; // null + picture type
      if (enc === 1 || enc === 2) { while (!(data[i] === 0 && data[i + 1] === 0)) i += 2; i += 2; } else { while (data[i] !== 0) i++; i++; }
      out.cover = URL.createObjectURL(new Blob([data.subarray(i)], { type: mime.includes('/') ? mime : 'image/' + mime.toLowerCase() }));
    } else if (id === 'USLT' && !out.lyrics) {
      let i = 4; // encoding + language
      if (enc === 1 || enc === 2) { while (!(data[i] === 0 && data[i + 1] === 0)) i += 2; i += 2; } else { while (data[i] !== 0) i++; i++; }
      out.lyrics = dec(data.subarray(i), enc);
    }
  }
  return out;
}

export function parseLRC(text) {
  const lines = [];
  for (const raw of text.split(/\r?\n/)) {
    const times = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    if (!times.length) continue;
    const words = raw.replace(/\[[^\]]*\]/g, '').trim();
    for (const t of times) lines.push({ t: +t[1] * 60 + +t[2], text: words });
  }
  return lines.sort((a, b) => a.t - b.t);
}
