const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nustFAQ', {
  getData: () => ipcRenderer.invoke('get-faq-data')
});
