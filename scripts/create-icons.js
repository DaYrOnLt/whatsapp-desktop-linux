const fs = require('fs');
const path = require('path');

// Generador de PNG simple (1x1 verde codificado en base64 expandible o PNG válido)
// PNG de 64x64 color verde WhatsApp (#25D366)
const greenPngBase64 = "iVBORw0KGgoAAAANSU50EUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADhJREFUeJztwQENAAAAwqD3T20PBxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwG4tAAABwS8k2QAAAABJRU5ErkJggg==";

const assetsDir = path.join(__dirname, '..', 'src', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const buffer = Buffer.from(greenPngBase64, 'base64');
fs.writeFileSync(path.join(assetsDir, 'icon.png'), buffer);
fs.writeFileSync(path.join(assetsDir, 'tray-icon.png'), buffer);
console.log('Iconos creados correctamente en src/assets/');
