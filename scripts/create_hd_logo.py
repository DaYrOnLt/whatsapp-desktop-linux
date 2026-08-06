import math
from PIL import Image, ImageDraw

def create_whatsapp_logo(filename, size=256):
    # Crear imagen RGBA transparente
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = int(size * 0.05)
    circle_size = size - (2 * margin)

    # 1. Dibujar círculo verde oficial (#25D366)
    whatsapp_green = (37, 211, 102, 255)
    draw.ellipse([margin, margin, margin + circle_size, margin + circle_size], fill=whatsapp_green)

    # 2. Dibujar cola de la burbuja de diálogo
    tail_points = [
        (int(size * 0.28), int(size * 0.72)),
        (int(size * 0.15), int(size * 0.85)),
        (int(size * 0.38), int(size * 0.80))
    ]
    draw.polygon(tail_points, fill=whatsapp_green)

    # 3. Dibujar ícono de teléfono/burbuja interna en blanco (#FFFFFF)
    white = (255, 255, 255, 255)
    phone_margin = int(size * 0.22)
    phone_size = size - (2 * phone_margin)
    
    # Dibujar contorno suavizado blanco de la burbuja de teléfono
    draw.ellipse([phone_margin, phone_margin, phone_margin + phone_size, phone_margin + phone_size], outline=white, width=int(size * 0.06))

    # Guardar
    img.save(filename, 'PNG')

if __name__ == '__main__':
    create_whatsapp_logo('src/assets/icon.png', 512)
    create_whatsapp_logo('src/assets/tray-icon.png', 128)
    print("Logo HD de WhatsApp generado exitosamente en src/assets/")
