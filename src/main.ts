import { app, BrowserWindow, Tray, Menu, ipcMain, globalShortcut, shell, Notification, nativeImage, session, MenuItemConstructorOptions } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Configurar el nombre oficial del proceso y WM_CLASS para Ubuntu / Linux Dock
app.setName('whatsapp-desktop-linux');

// Desactivar el sandbox y la aceleración por hardware de GPU en Linux para evitar recuadros blancos de renderizado en video/llamadas
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('disable-gpu-compositing');

// Control de instancia única para evitar bloqueos de base de datos LevelDB/SQLite
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Ya existe una instancia de WhatsApp Desktop ejecutándose. Enfocando ventana existente...');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

let mainWindow: BrowserWindow | null = null;
let preferencesWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function loadSettings(): Record<string, any> {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error al cargar ajustes:', e);
  }
  return { minimizeToTray: true, autoStart: false, nativeNotifications: true, activeAccount: 0, spellcheck: true };
}

function saveSettings(settings: Record<string, any>) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
  } catch (e) {
    console.error('Error al guardar ajustes:', e);
  }
}

const currentSettings = loadSettings();
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

function configurePersistentSessions() {
  const partitions = ['persist:whatsapp_account_1', 'persist:whatsapp_account_2', 'persist:whatsapp_account_3'];

  partitions.forEach((partitionName) => {
    const customSession = session.fromPartition(partitionName);
    
    // Asignar User-Agent de Chrome
    customSession.setUserAgent(USER_AGENT);

    // Habilitar corrector ortográfico nativo preciso en Español
    customSession.setSpellCheckerLanguages(['es-MX', 'es-ES', 'es']);

    // Conceder permisos WebRTC (cámara, micrófono, notificaciones) solo si provienen de dominios de WhatsApp
    customSession.setPermissionRequestHandler((webContents, permission, callback) => {
      const url = webContents.getURL();
      if (url.includes('whatsapp.com') || url.includes('web.whatsapp.com') || url.startsWith('about:blank')) {
        callback(true);
      } else {
        console.warn(`Permiso rechazado para origen no confiable: ${url} (${permission})`);
        callback(false);
      }
    });

    customSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
      return requestingOrigin.includes('whatsapp.com') || requestingOrigin.includes('web.whatsapp.com');
    });

    customSession.allowNTLMCredentialsForDomains('*.whatsapp.com');
  });
}

// Configurar WebContents (incluyendo webviews para llamadas emergentes y clic derecho)
app.on('web-contents-created', (_, contents) => {
  // Manejar ventanas emergentes / popups (Llamadas y Videollamadas de WhatsApp)
  contents.setWindowOpenHandler(({ url }) => {
    // Permitir popups internos de WhatsApp Web (llamadas/videollamadas y reproductores)
    if (url.includes('whatsapp.com') || url.includes('web.whatsapp.com') || url.startsWith('about:blank')) {
      const parentSession = contents.session;

      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          backgroundColor: '#111b21',
          icon: path.join(__dirname, 'assets/icon.png'),
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            session: parentSession
          }
        }
      };
    }

    // Abrir enlaces externos en el navegador web predeterminado del sistema
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Sugerencias ortográficas por clic derecho
  contents.on('context-menu', (_, params) => {
    const menuTemplate: MenuItemConstructorOptions[] = [];

    if (params.misspelledWord && params.dictionarySuggestions && params.dictionarySuggestions.length > 0) {
      params.dictionarySuggestions.forEach((suggestion) => {
        menuTemplate.push({
          label: suggestion,
          click: () => contents.replaceMisspelling(suggestion)
        });
      });

      menuTemplate.push({ type: 'separator' });
      menuTemplate.push({
        label: `Añadir "${params.misspelledWord}" al diccionario`,
        click: () => contents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
      });
      menuTemplate.push({ type: 'separator' });
    } else if (params.misspelledWord) {
      menuTemplate.push({
        label: `Añadir "${params.misspelledWord}" al diccionario`,
        click: () => contents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
      });
      menuTemplate.push({ type: 'separator' });
    }

    menuTemplate.push(
      { label: 'Cortar', role: 'cut', enabled: params.editFlags.canCut },
      { label: 'Copiar', role: 'copy', enabled: params.editFlags.canCopy },
      { label: 'Pegar', role: 'paste', enabled: params.editFlags.canPaste },
      { label: 'Seleccionar todo', role: 'selectAll', enabled: params.editFlags.canSelectAll }
    );

    const menu = Menu.buildFromTemplate(menuTemplate);
    menu.popup();
  });
});

function createMainWindow() {
  configurePersistentSessions();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 850,
    minHeight: 550,
    title: 'WhatsApp Desktop',
    backgroundColor: '#0f172a',
    icon: path.join(__dirname, 'assets/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      spellcheck: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('close', (event) => {
    if (!isQuitting && currentSettings.minimizeToTray) {
      event.preventDefault();
      mainWindow?.hide();
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets/tray-icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);
  tray.setToolTip('WhatsApp Desktop (Multi-Cuenta)');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '🟢 Cuenta 1 (Personal)',
      click: () => switchAccount(0)
    },
    {
      label: '💼 Cuenta 2 (Trabajo)',
      click: () => switchAccount(1)
    },
    {
      label: '📱 Cuenta 3 (Adicional)',
      click: () => switchAccount(2)
    },
    { type: 'separator' },
    {
      label: 'Mostrar / Ocultar WhatsApp',
      click: () => toggleWindowVisibility()
    },
    {
      label: 'Ajustes y Preferencias...',
      click: () => openPreferencesWindow()
    },
    { type: 'separator' },
    {
      label: 'Salir de WhatsApp',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    toggleWindowVisibility();
  });
}

function switchAccount(index: number) {
  mainWindow?.webContents.send('account-switched', index);
}

function toggleWindowVisibility() {
  if (!mainWindow) return;
  if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function openPreferencesWindow() {
  if (preferencesWindow) {
    preferencesWindow.focus();
    return;
  }

  preferencesWindow = new BrowserWindow({
    width: 520,
    height: 480,
    resizable: false,
    title: 'Ajustes — WhatsApp Desktop',
    icon: path.join(__dirname, 'assets/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  preferencesWindow.loadFile(path.join(__dirname, 'preferences.html'));

  preferencesWindow.on('closed', () => {
    preferencesWindow = null;
  });
}

// IPC Handlers
ipcMain.on('whatsapp-notification', (_, data: { title: string; body: string; accountIndex?: number }) => {
  if (currentSettings.nativeNotifications && Notification.isSupported()) {
    const notification = new Notification({
      title: data.title || 'Nuevo Mensaje',
      body: data.body || '',
      icon: path.join(__dirname, 'assets/icon.png')
    });

    notification.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        if (typeof data.accountIndex === 'number') {
          switchAccount(data.accountIndex);
        }
      }
    });

    notification.show();
  }
});

ipcMain.on('update-unread-total', (_, total: number) => {
  if (total > 0) {
    tray?.setToolTip(`WhatsApp Desktop (${total} no leídos)`);
    if (process.platform === 'linux') {
      app.setBadgeCount(total);
    }
  } else {
    tray?.setToolTip('WhatsApp Desktop (Multi-Cuenta)');
    if (process.platform === 'linux') {
      app.setBadgeCount(0);
    }
  }
});

ipcMain.handle('get-settings', () => currentSettings);

ipcMain.on('open-preferences', () => {
  openPreferencesWindow();
});

ipcMain.on('save-setting', (_, data: { key: string; value: any }) => {
  currentSettings[data.key] = data.value;
  saveSettings(currentSettings);

  if (data.key === 'autoStart') {
    app.setLoginItemSettings({
      openAtLogin: !!data.value
    });
  }
});

// Limpieza de caché de sesiones sin cerrar sesión
ipcMain.on('clear-cache', async () => {
  const partitions = ['persist:whatsapp_account_1', 'persist:whatsapp_account_2', 'persist:whatsapp_account_3'];
  for (const partitionName of partitions) {
    const customSession = session.fromPartition(partitionName);
    await customSession.clearCache();
    await customSession.clearStorageData({ storages: ['serviceworkers', 'cachestorage'] });
  }
  app.relaunch();
  app.exit(0);
});

// Inicialización de la App
app.whenReady().then(() => {
  createMainWindow();
  createTray();

  // Registrar atajos de teclado globales
  globalShortcut.register('Ctrl+Alt+W', () => toggleWindowVisibility());
  globalShortcut.register('Ctrl+1', () => switchAccount(0));
  globalShortcut.register('Ctrl+2', () => switchAccount(1));
  globalShortcut.register('Ctrl+3', () => switchAccount(2));

  // Atajos de zoom de interfaz
  globalShortcut.register('CommandOrControl+=', () => mainWindow?.webContents.send('zoom-in'));
  globalShortcut.register('CommandOrControl+-', () => mainWindow?.webContents.send('zoom-out'));
  globalShortcut.register('CommandOrControl+0', () => mainWindow?.webContents.send('zoom-reset'));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
