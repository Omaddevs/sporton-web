"""Clean black studio BG; preserve face/hair (no washed-out edges)."""
from PIL import Image, ImageEnhance, ImageFilter
from collections import deque
import numpy as np

SRC = r"D:\Projects\ayolkaryera\public\images\hero\woman-src.jpg"
OUT = r"D:\Projects\ayolkaryera\public\images\hero\woman.png"

img = Image.open(SRC).convert("RGBA")
arr = np.array(img)
h, w = arr.shape[:2]
rgb = arr[:, :, :3].astype(np.int16)
brightness = rgb.max(axis=2)

# Only near-pure black counts as background
is_bg = brightness <= 18

visited = np.zeros((h, w), dtype=bool)
q = deque()
for x in range(w):
    for y in (0, h - 1):
        if is_bg[y, x]:
            visited[y, x] = True
            q.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        if is_bg[y, x] and not visited[y, x]:
            visited[y, x] = True
            q.append((x, y))

while q:
    x, y = q.popleft()
    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1),
                   (x - 1, y - 1), (x + 1, y - 1), (x - 1, y + 1), (x + 1, y + 1)):
        if 0 <= nx < w and 0 <= ny < h and not visited[ny, nx] and is_bg[ny, nx]:
            visited[ny, nx] = True
            q.append((nx, ny))

alpha = np.full((h, w), 255, dtype=np.uint8)
alpha[visited] = 0

# Very thin soft fringe only on near-black next to removed bg (keeps hair solid)
dilated = np.array(
    Image.fromarray((visited.astype(np.uint8) * 255)).filter(ImageFilter.MaxFilter(3))
) > 0
fringe = dilated & ~visited & (brightness <= 32)
# Keep fringe mostly opaque so hair doesn't look washed out
alpha[fringe] = np.clip(((brightness[fringe].astype(np.float32) - 8) / 24) * 220 + 35, 35, 255).astype(
    np.uint8
)

out = arr.copy()
out[:, :, 3] = alpha
out[alpha == 0, 0:3] = 0

result = Image.fromarray(out, "RGBA")

# Restore face color/clarity (undo washed-out look)
rgb_img = result.convert("RGB")
rgb_img = ImageEnhance.Contrast(rgb_img).enhance(1.08)
rgb_img = ImageEnhance.Color(rgb_img).enhance(1.12)
rgb_img = ImageEnhance.Brightness(rgb_img).enhance(1.02)
rgb_img = ImageEnhance.Sharpness(rgb_img).enhance(1.18)

final = rgb_img.convert("RGBA")
final.putalpha(Image.fromarray(alpha, "L"))

# Add a little top padding so hair isn't clipped by layout
pad_top = 24
canvas = Image.new("RGBA", (final.width, final.height + pad_top), (0, 0, 0, 0))
canvas.paste(final, (0, pad_top), final)
canvas.save(OUT, "PNG", optimize=True)
print("saved", OUT, canvas.size)
