"""Recover washed-out face/hair highlights after cutout."""
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import numpy as np

SRC = r"D:\Projects\ayolkaryera\public\images\hero\woman.png"
OUT = SRC
PREVIEW = r"D:\Projects\ayolkaryera\public\images\hero\woman-preview.jpg"

img = Image.open(SRC).convert("RGBA")
arr = np.array(img).astype(np.float32)
rgb = arr[:, :, :3]
a = arr[:, :, 3]

# Luma
luma = 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]

# Recover blown highlights (face/hair bright spots)
# Soft knee compression above threshold
hi = np.clip((luma - 185) / 70, 0, 1)  # 0..1 where bright
# Pull highlights down & add a touch of warmth so skin doesn't go chalky
recover = hi[..., None]
rgb = rgb - recover * np.array([38, 42, 48])  # darken bright areas
rgb = rgb + recover * np.array([8, 2, 0])  # slight warm restore

# Local midtone punch where subject exists
mask = (a > 200).astype(np.float32)[..., None]
mid = np.clip((luma - 90) / 100, 0, 1)[..., None]
rgb = rgb + mask * mid * np.array([4, 2, 2])

rgb = np.clip(rgb, 0, 255)
out_arr = np.dstack([rgb, a]).astype(np.uint8)
out = Image.fromarray(out_arr, "RGBA")

# Global clarity
rgb_img = out.convert("RGB")
rgb_img = ImageEnhance.Contrast(rgb_img).enhance(1.1)
rgb_img = ImageEnhance.Color(rgb_img).enhance(1.14)
rgb_img = ImageEnhance.Sharpness(rgb_img).enhance(1.25)
# Unsharp-ish via detail
detail = ImageOps.autocontrast(rgb_img, cutoff=1)
rgb_img = Image.blend(rgb_img, detail, 0.18)

final = rgb_img.convert("RGBA")
final.putalpha(out.split()[-1])
final.save(OUT, "PNG", optimize=True)

bg = Image.new("RGBA", final.size, (255, 245, 248, 255))
bg.alpha_composite(final)
bg.convert("RGB").save(PREVIEW, quality=92)
print("recovered", final.size)
