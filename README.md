# 💬 WhatsApp Desktop Linux (Multi-Cuenta)

Cliente nativo de escritorio premium de WhatsApp para Linux (Ubuntu, Debian y derivados) con soporte **Multi-Cuenta (Dual WhatsApp)**, corrector ortográfico en español y ventanas emergentes para llamadas y videollamadas.

---

## 🔥 Características Principales

- 🟢 **Soporte Multi-Cuenta (Estilo ZapZap):**
  - Manejo de **Cuenta 1 (Personal)** y **Cuenta 2 (Trabajo)** de forma 100% aislada.
  - Sesiones persistentes e independientes en disco (`persist:whatsapp_account_1` y `persist:whatsapp_account_2`).
  - Cambia entre cuentas instantáneamente usando los atajos **`Ctrl + 1`** y **`Ctrl + 2`**.

- ✍️ **Corrector Ortográfico Nativo en Español:**
  - Motor de corrección en **Español (México y España)** con subrayado rojo en tiempo real.
  - Menú contextual de sugerencias precisas por **clic derecho** sobre cualquier palabra en el chat.

- 📞 **Llamadas y Videollamadas Emergentes:**
  - Soporte completo para ventanas flotantes emergentes de llamadas y videollamadas con permisos WebRTC (cámara y micrófono).

- 📌 **Integración en Ubuntu:**
  - Icono flotante en la bandeja del sistema (Tray Icon) con contador de mensajes no leídos.
  - Atajo global **`Ctrl + Alt + W`** para mostrar u ocultar la ventana desde cualquier lugar.
  - Lanzador de escritorio `.desktop` independiente con su propia identidad `whatsapp-desktop-linux`.

---

## 🚀 Instalación Rápida (1 Clic)

1. Clona el repositorio:
   ```bash
   git clone https://github.com/DaYrOnLt/whatsapp-desktop-linux.git
   cd whatsapp-desktop-linux
   ```

2. Ejecuta el script de instalación automática:
   ```bash
   ./instalar.sh
   ```

---

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Compilar proyecto TypeScript
npm run build

# Ejecutar en desarrollo
npm start
```

---

### 👨‍💻 Autor y Mantenimiento
Desarrollado por **[DaYrOnLt](https://github.com/DaYrOnLt)** con asistencia de **Antigravity AI**.
