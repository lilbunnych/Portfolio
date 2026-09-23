// Jot main process: window, native menu, and file-backed note storage.
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const isMac = process.platform === 'darwin';
const storeFile = () => path.join(app.getPath('userData'), 'notes.json');

const SAMPLE = [
  { id: 'welcome', title: 'Welcome to Jot', updated: Date.now(), body: '# Welcome to Jot\n\nJot is a small **Markdown** notes app. Everything saves automatically.\n\n## Shortcuts\n\n- `Ctrl/Cmd + N` new note\n- `Ctrl/Cmd + F` search notes\n- `Ctrl/Cmd + 1 / 2 / 3` editor, split, preview\n- `Ctrl/Cmd + E` export the note as a `.md` file\n\n> This is a portfolio demo. Notes are stored only on this computer.' },
  { id: 'groceries', title: 'Weekend market list', updated: Date.now() - 36e5, body: '# Weekend market list\n\n- [x] Sourdough\n- [ ] Tomatoes, the ugly ones\n- [ ] Goat cheese\n- [ ] Flowers for the table\n' },
  { id: 'ideas', title: 'Talk ideas', updated: Date.now() - 864e5, body: '# Talk ideas\n\n1. Shipping small tools that people keep using\n2. Why offline-first still matters\n3. Reading code out loud\n\n```js\nconst idea = notes.find(n => n.good);\n```\n' },
];

async function readNotes() {
  try { return JSON.parse(await fs.readFile(storeFile(), 'utf8')); }
  catch { await writeNotes(SAMPLE); return SAMPLE; }
}
async function writeNotes(notes) {
  await fs.mkdir(path.dirname(storeFile()), { recursive: true });
  const tmp = storeFile() + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(notes, null, 2));
  await fs.rename(tmp, storeFile()); // atomic replace
}

ipcMain.handle('notes:list', () => readNotes());
ipcMain.handle('notes:save', async (_e, note) => {
  if (!note || typeof note.id !== 'string') throw new Error('Invalid note');
  const notes = await readNotes();
  const i = notes.findIndex(n => n.id === note.id);
  const clean = { id: note.id, title: String(note.title || 'Untitled').slice(0, 200), body: String(note.body || ''), updated: Date.now() };
  if (i >= 0) notes[i] = clean; else notes.unshift(clean);
  await writeNotes(notes);
  return clean;
});
ipcMain.handle('notes:delete', async (_e, id) => {
  await writeNotes((await readNotes()).filter(n => n.id !== id));
  return true;
});
ipcMain.handle('notes:export', async (e, note) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const safe = String(note.title || 'note').replace(/[^\w\- ]+/g, '').trim() || 'note';
  const { canceled, filePath } = await dialog.showSaveDialog(win, { defaultPath: `${safe}.md`, filters: [{ name: 'Markdown', extensions: ['md'] }] });
  if (canceled || !filePath) return false;
  await fs.writeFile(filePath, String(note.body || ''));
  return true;
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 780, minWidth: 760, minHeight: 480,
    title: 'Jot',
    backgroundColor: '#15171a',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.loadFile(path.join(__dirname, 'index.html'));
  // Open external links in the default browser, never inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
}

const send = (channel) => BrowserWindow.getFocusedWindow()?.webContents.send('menu', channel);
const template = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  { label: 'File', submenu: [
    { label: 'New Note', accelerator: 'CmdOrCtrl+N', click: () => send('new') },
    { label: 'Export as Markdown…', accelerator: 'CmdOrCtrl+E', click: () => send('export') },
    { type: 'separator' }, isMac ? { role: 'close' } : { role: 'quit' },
  ] },
  { role: 'editMenu' },
  { label: 'View', submenu: [
    { label: 'Editor', accelerator: 'CmdOrCtrl+1', click: () => send('mode:edit') },
    { label: 'Split', accelerator: 'CmdOrCtrl+2', click: () => send('mode:split') },
    { label: 'Preview', accelerator: 'CmdOrCtrl+3', click: () => send('mode:preview') },
    { label: 'Search Notes', accelerator: 'CmdOrCtrl+F', click: () => send('search') },
    { type: 'separator' }, { role: 'togglefullscreen' }, { role: 'toggleDevTools' },
  ] },
  { role: 'windowMenu' },
];

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (!isMac) app.quit(); });
