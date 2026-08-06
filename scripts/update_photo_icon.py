import os
from PIL import Image, ImageDraw, ImageOps

source_path = "/home/itsupport/.gbs-portal-profile/Profile 1/Google Profile Picture.png"
target_icon = "/home/itsupport/proyectos/whatsapp-desktop-linux/src/assets/icon.png"
target_tray = "/home/itsupport/proyectos/whatsapp-desktop-linux/src/assets/tray-icon.png"
target_dist_icon = "/home/itsupport/proyectos/whatsapp-desktop-linux/dist/assets/icon.png"
target_dist_tray = "/home/itsupport/proyectos/whatsapp-desktop-linux/dist/assets/tray-icon.png"

if os.path.exists(source_path):
    img = Image.open(source_path).convert("RGBA")
    
    # Crear un icono HD de 512x512 con avatar circular y anillo verde de WhatsApp
    size = 512
    mask = Image.new("L", (size, size), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse((16, 16, size - 16, size - 16), fill=255)
    
    # Fondo con anillo verde de WhatsApp (#25D366)
    ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_ring = ImageDraw.Draw(ring)
    draw_ring.ellipse((0, 0, size, size), fill="#25D366")
    
    # Redimensionar la foto del usuario
    img_resized = img.resize((size - 32, size - 32), Image.Resampling.LANCZOS)
    
    # Aplicar mascara circular
    inner_mask = Image.new("L", (size - 32, size - 32), 0)
    ImageDraw.Draw(inner_mask).ellipse((0, 0, size - 32, size - 32), fill=255)
    
    ring.paste(img_resized, (16, 16), inner_mask)
    
    # Guardar en las ubicaciones de assets
    os.makedirs(os.path.dirname(target_icon), exist_ok=True)
    os.makedirs(os.path.dirname(target_dist_icon), exist_ok=True)
    
    ring.save(target_icon, "PNG")
    ring.save(target_dist_icon, "PNG")
    
    # Tray icon
    tray_img = ring.resize((128, 128), Image.Resampling.LANCZOS)
    tray_img.save(target_tray, "PNG")
    tray_img.save(target_dist_tray, "PNG")
    
    print("✅ ¡Nuevo icono personalizado creado e instalado exitosamente con tu foto!")
else:
    print("❌ No se encontró la imagen fuente.")
