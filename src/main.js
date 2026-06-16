'use strict';

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const APP_URL =
  'https://script.google.com/macros/s/AKfycbykf_0q8m_HnNrX8prYHeEXYh6kxo9u6W0U_7g4I6TyyQ9k7huLt2K0VqvYBIY-5Fwc/exec';

const ICON = path.join(__dirname, '..', 'assets', 'icon.png');

function createSplash() {
  const splash = new BrowserWindow({
    width: 420,
    height: 320,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    resizable: false,
    icon: ICON,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  splash.loadFile(path.join(__dirname, '..', 'assets', 'splash.html'));
  return splash;
}

function createMain(splash) {
  const win = new BrowserWindow({
    width: 960,
    height: 820,
    minWidth: 480,
    minHeight: 600,
    title: 'AA Motor Medic | Staff Booking',
    icon: ICON,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // Allow Google OAuth redirects that happen inside the web app
      partition: 'persist:aamm',
    },
  });

  win.loadURL(APP_URL);

  win.webContents.on('did-finish-load', () => {
    if (splash && !splash.isDestroyed()) splash.destroy();
    win.show();
  });

  // If load fails (no internet), still close splash and show the window
  win.webContents.on('did-fail-load', () => {
    if (splash && !splash.isDestroyed()) splash.destroy();
    win.show();
  });

  // Open target="_blank" links in the default browser, not a new Electron window
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  return win;
}

app.whenReady().then(() => {
  const splash = createSplash();
  createMain(splash);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMain(null);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
