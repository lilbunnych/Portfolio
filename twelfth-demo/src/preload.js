const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('nocturne', {
  desktop: true,
  platform: process.platform,
  onMenu: (fn) => ipcRenderer.on('menu', (_e, ch) => fn(ch)),
});
