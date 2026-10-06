from rembg import remove, new_session
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

SRC = r"D:\Projects\ayolkaryera\public\images\hero\woman-src.jpg"
OUT = r"D:\Projects\ayolkaryera\public\images\hero\woman.png"
PREVIEW = r"D:\Projects\ayolkaryera\public\images\hero\woman-preview.jpg"

session = new_session("u2net")
src = Image.open(SRC).convert("RGBA")
cut = remove(src, session=session)

rgb = cut.convert("RGB")
rgb = ImageEnhance.Contrast(rgb).enhance(1.06)
rgb = ImageEnhance.Color(rgb).enhance(1.1)
rgb = ImageEnhance.Sharpness(rgb).enhance(1.15)

alpha = cut.split()[-1]
# Keep hair mostly solid — slight blur only on mask edge
alpha = alpha.filter(ImageFilter.GaussianBlur(0.45))

out = rgb.convert("RGBA")
arr = np.array(out)
a = np.array(alpha)
# Despill: where alpha is low, don't keep black RGB (causes dirty edges on pink bg)
low = a < 200
# Blend toward pink-neutral so edges don't go grey/black
arr[low, 0] = np.maximum(arr[low, 0], ((200 - a[low]) * 0.55).astype(np.uint8))
arr[low, 1] = np.maximum(arr[low, 1], ((200 - a[low]) * 0.25).astype(np.uint8))
arr[low, 2] = np.maximum(arr[low, 2], ((200 - a[low]) * 0.35).astype(np.uint8))
arr[:, :, 3] = a
arr[a == 0, 0:3] = 0
out = Image.fromarray(arr, "RGBA")

pad_top = 28
canvas = Image.new("RGBA", (out.width, out.height + pad_top), (0, 0, 0, 0))
canvas.paste(out, (0, pad_top), out)
canvas.save(OUT, "PNG", optimize=True)

bg = Image.new("RGBA", canvas.size, (255, 245, 248, 255))
bg.alpha_composite(canvas)
bg.convert("RGB").save(PREVIEW, quality=92)
print("ok", canvas.size)
