const { app, BrowserWindow, ipcMain, protocol, net } = require('electron');
const path = require('path');
const url = require('url');
const { parseFAQs } = require('../lib/parser');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

// We must register standard schemes before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true // Important to keep webSecurity enabled
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadURL('app://localhost/index.html');
  }
}

app.whenReady().then(() => {
  // Register custom protocol to serve Next.js static files correctly since Next.js expects a root /
  protocol.handle('app', (request) => {
    try {
      const parsedUrl = new URL(request.url);
      let requestPath = parsedUrl.pathname;

      if (requestPath === '' || requestPath === '/') {
        requestPath = '/index.html';
      }

      // Strip leading slashes safely for path.join (prevents resolving to C:\ on Windows)
      const relativePath = requestPath.replace(/^\/+/, '');
      const finalPath = path.join(__dirname, '../out', relativePath);
      
      // using url.pathToFileURL natively resolves slashes and encoding perfectly
      return net.fetch(url.pathToFileURL(finalPath).href);
    } catch (err) {
      console.error('Protocol handler error:', err);
      // Fallback
      return new Response('Not found', { status: 404 });
    }
  });

  // Read and parse FAQ once on startup
  const faqData = parseFAQs(path.join(__dirname, '../NUST_FAQs_Complete.txt'));
  
  // Register IPC handler to return the data synchronously to the frontend when asked
  ipcMain.handle('get-faq-data', () => faqData);

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
