const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 既存の API …
  // onOpenAboutDialog: (handler) => ipcRenderer.on('open-about-dialog', handler),

  writeLog: async (message) => {
    try {
      await ipcRenderer.invoke('write-log', message);
    } catch (e) {
      console.error('writeLog failed', e);
    }
  }
});
