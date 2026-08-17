#!/bin/bash
# Script de instalación automática de WhatsApp Desktop Multi-Cuenta para Linux

echo "=========================================================="
echo "  Instalador de WhatsApp Desktop Multi-Cuenta para Linux  "
echo "=========================================================="

APP_DIR="$HOME/.local/share/whatsapp-desktop-linux"
DESKTOP_FILE="$HOME/.local/share/applications/whatsapp-desktop.desktop"

# Si no existe la carpeta empaquetada, instalar dependencias y compilar automáticamente
if [ ! -d "release/linux-unpacked" ]; then
    echo "⚡ Primera instalación en esta PC detectada. Compilando aplicación..."
    
    # Detectar gestor de paquetes (Priorizar pnpm por velocidad y seguridad)
    if command -v pnpm &> /dev/null; then
        PKG_MGR="pnpm"
    elif command -v npm &> /dev/null; then
        PKG_MGR="npm"
    else
        echo "❌ Error: Ni pnpm ni npm/Node.js están instalados en este sistema."
        echo "   Por favor instala Node.js / pnpm (ej: sudo apt install nodejs npm o corepack enable) y vuelve a intentar."
        exit 1
    fi

    echo "📦 Instalando dependencias con $PKG_MGR..."
    $PKG_MGR install
    echo "⚙️ Compilando código ($PKG_MGR run build)..."
    $PKG_MGR run build
    echo "🔨 Empaquetando ejecutable (electron-builder)..."
    if [ "$PKG_MGR" == "pnpm" ]; then
        pnpm exec electron-builder --linux dir
    else
        npx electron-builder --linux dir
    fi
fi

mkdir -p "$APP_DIR"
mkdir -p "$HOME/.local/share/applications"

# Cerrar instancias en ejecución previa para desbloquear el ejecutable ('Text file busy')
pkill -f whatsapp-desktop-linux 2>/dev/null || true
fuser -k -9 "$APP_DIR/whatsapp-desktop-linux" 2>/dev/null || true

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
