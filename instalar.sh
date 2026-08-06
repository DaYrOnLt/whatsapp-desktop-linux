#!/bin/bash
# Script de instalación automática de WhatsApp Desktop Multi-Cuenta para Linux

echo "=========================================================="
echo "  Instalador de WhatsApp Desktop Multi-Cuenta para Linux  "
echo "=========================================================="

APP_DIR="$HOME/.local/share/whatsapp-desktop-linux"
DESKTOP_FILE="$HOME/.local/share/applications/whatsapp-desktop.desktop"

mkdir -p "$APP_DIR"
mkdir -p "$HOME/.local/share/applications"

echo "📦 Copiando archivos de la aplicación..."
cp -r release/linux-unpacked/* "$APP_DIR/"
cp -r dist/assets "$APP_DIR/" 2>/dev/null || true

chmod +x "$APP_DIR/whatsapp-desktop-linux"

echo "🖥️ Creando acceso directo en el menú de aplicaciones..."
cat << EOF > "$DESKTOP_FILE"
[Desktop Entry]
Name=WhatsApp Desktop
Comment=Cliente de escritorio nativo de WhatsApp para Linux con soporte Multi-Cuenta
Exec=$APP_DIR/whatsapp-desktop-linux --no-sandbox %U
Icon=$APP_DIR/assets/icon.png
Terminal=false
Type=Application
Categories=Network;InstantMessaging;Chat;
StartupWMClass=whatsapp-desktop-linux
EOF

chmod +x "$DESKTOP_FILE"
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true

echo "✅ ¡Instalación completada con éxito!"
echo "Puedes buscar 'WhatsApp Desktop' en tu menú de aplicaciones."
