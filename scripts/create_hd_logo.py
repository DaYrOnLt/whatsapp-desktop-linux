import os
from PIL import Image, ImageDraw

def create_hd_whatsapp_logo(size=512):
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Anillo/Círculo Verde Oficial WhatsApp #25D366
    green_color = (37, 211, 102, 255)
    white_color = (255, 255, 255, 255)
    
    margin = int(size * 0.05)
    draw.ellipse([margin, margin, size - margin, size - margin], fill=green_color)
    
    # Cola de la burbuja de diálogo
    tail = [(int(size * 0.22), int(size * 0.72)), (int(size * 0.12), int(size * 0.88)), (int(size * 0.32), int(size * 0.82))]
    draw.polygon(tail, fill=green_color)
    
    # Silueta de Teléfono en Blanco
    center_x, center_y = size // 2, size // 2
    r_outer = int(size * 0.30)
    r_inner = int(size * 0.23)
    
    draw.ellipse([center_x - r_outer, center_y - r_outer, center_x + r_outer, center_y + r_outer], outline=white_color, width=int(size * 0.06))
    
    return image

icon_512 = create_hd_whatsapp_logo(512)
tray_128 = create_hd_whatsapp_logo(128)

base_dir = "/home/itsupport/proyectos/whatsapp-desktop-linux"

os.makedirs(f"{base_dir}/src/assets", exist_ok=True)
os.makedirs(f"{base_dir}/dist/assets", exist_ok=True)

icon_512.save(f"{base_dir}/src/assets/icon.png", "PNG")
icon_512.save(f"{base_dir}/dist/assets/icon.png", "PNG")

tray_128.save(f"{base_dir}/src/assets/tray-icon.png", "PNG")
tray_128.save(f"{base_dir}/dist/assets/tray-icon.png", "PNG")

print("✅ ¡Logo clásico oficial de WhatsApp restaurado exitosamente!")
