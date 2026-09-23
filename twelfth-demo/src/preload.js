// Narrow, typed bridge between the sandboxed page and the main process.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jot', {
  list: () => ipcRenderer.invoke('notes:list'),
  save: (note) => ipcRenderer.invoke('notes:save', note),
  remove: (id) => ipcRenderer.invoke('notes:delete', id),
  exportNote: (note) => ipcRenderer.invoke('notes:export', note),
  onMenu: (fn) => ipcRenderer.on('menu', (_e, channel) => fn(channel)),
  platform: process.platform,
});
