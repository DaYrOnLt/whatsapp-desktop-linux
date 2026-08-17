#!/bin/bash
# Script de desinstalación de WhatsApp Desktop Multi-Cuenta para Linux

echo "=========================================================="
echo " Desinstalador de WhatsApp Desktop Multi-Cuenta para Linux "
echo "=========================================================="

APP_DIR="$HOME/.local/share/whatsapp-desktop-linux"
DESKTOP_FILE="$HOME/.local/share/applications/whatsapp-desktop.desktop"
CONFIG_DIR="$HOME/.config/whatsapp-desktop-linux"

# 1. Detener procesos en ejecución
echo "🛑 Deteniendo procesos de WhatsApp Desktop en ejecución..."
pkill -f whatsapp-desktop-linux 2>/dev/null || true

# 2. Eliminar archivos de la aplicación
if [ -d "$APP_DIR" ]; then
    echo "🗑️ Eliminando binarios y archivos de la aplicación ($APP_DIR)..."
    rm -rf "$APP_DIR"
fi

# 3. Eliminar acceso directo del menú de aplicaciones
if [ -f "$DESKTOP_FILE" ]; then
    echo "🖥️ Eliminando acceso directo ($DESKTOP_FILE)..."
    rm -f "$DESKTOP_FILE"
    update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
fi

# 4. Opción para purgar datos de sesiones/configuración
if [ "$1" == "--purge" ]; then
    if [ -d "$CONFIG_DIR" ]; then
        echo "🔥 Eliminando datos de sesiones y configuración ($CONFIG_DIR)..."
        rm -rf "$CONFIG_DIR"
    fi
else
    echo "ℹ️ Las sesiones guardadas en $CONFIG_DIR se conservaron."
    echo "   (Para eliminarlas también, ejecuta: ./desinstalar.sh --purge)"
fi

echo "✅ ¡Desinstalación completada con éxito!"
