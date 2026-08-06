import { contextBridge, ipcRenderer } from 'electron';

// Monitor de contador de mensajes no leídos desde el título de la página
function setupUnreadCounter() {
  const updateCount = () => {
    const title = document.title;
    const match = title.match(/\((\d+)\)/);
    const count = match ? parseInt(match[1], 10) : 0;
    ipcRenderer.send('update-unread-count', count);
  };

  // Observador de cambios en el título <title>
  const target = document.querySelector('title');
  if (target) {
    const observer = new MutationObserver(() => updateCount());
    observer.observe(target, { subtree: true, characterData: true, childList: true });
  }

  // Comprobación periódica por respaldo
  setInterval(updateCount, 2500);
}

// Interceptor de Notificaciones Nativas
function setupNotificationInterceptor() {
  const NativeNotification = window.Notification;

  class CustomNotification extends NativeNotification {
    constructor(title: string, options?: NotificationOptions) {
      super(title, options);

      // Reenviar notificación al proceso nativo de Electron para integración con Ubuntu
      ipcRenderer.send('whatsapp-notification', {
        title,
        body: options?.body || '',
        icon: options?.icon || ''
      });
    }
  }

  // Reemplazar globalmente
  (window as any).Notification = CustomNotification;
}

// Ejecutar al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  setupUnreadCounter();
  setupNotificationInterceptor();
});

// Exponer API segura al contexto web
contextBridge.exposeInMainWorld('electronAPI', {
  sendUnreadCount: (count: number) => ipcRenderer.send('update-unread-count', count),
  openPreferences: () => ipcRenderer.send('open-preferences')
});
