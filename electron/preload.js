const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the frontend
contextBridge.exposeInMainWorld('electronAPI', {
  // Add methods here if you need to communicate with Electron main process
});
