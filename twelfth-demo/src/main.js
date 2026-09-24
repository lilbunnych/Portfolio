// Nocturne main process: window, native menu, file dialog.
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('node:path');

const isMac = process.platform === 'darwin';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 900, minHeight: 600,
    title: 'Nocturne',
    backgroundColor: '#07060c',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
}

const send = (ch) => BrowserWindow.getFocusedWindow()?.webContents.send('menu', ch);
const template = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  { label: 'File', submenu: [
    { label: 'Add Music…', accelerator: 'CmdOrCtrl+O', click: () => send('add') },
    { label: 'Add Folder…', accelerator: 'CmdOrCtrl+Shift+O', click: () => send('folder') },
    { type: 'separator' }, isMac ? { role: 'close' } : { role: 'quit' },
  ] },
  { label: 'Playback', submenu: [
    { label: 'Play / Pause', accelerator: 'Space', registerAccelerator: false, click: () => send('toggle') },
    { label: 'Next', accelerator: 'CmdOrCtrl+Right', click: () => send('next') },
    { label: 'Previous', accelerator: 'CmdOrCtrl+Left', click: () => send('prev') },
    { label: 'Show Lyrics', accelerator: 'CmdOrCtrl+L', click: () => send('lyrics') },
  ] },
  { label: 'View', submenu: [{ role: 'togglefullscreen' }, { role: 'toggleDevTools' }] },
  { role: 'windowMenu' },
];

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (!isMac) app.quit(); });
