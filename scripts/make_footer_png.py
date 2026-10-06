"""Remove solid black background without punching holes in eyes/hair."""

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

SRC_CANDIDATES = [
    Path(
        r"C:\Users\User\.cursor\projects\d-Projects-ayolkaryera\assets"
        r"\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_"
        r"a2cda55cf7fec73f0c876a0439fe876c_images_ChatGPT_Image_Sep_15__2026__"
        r"12_11_29_PM-975b175a-3aec-43a1-a5de-bcb4a1e1c11b.jpg"
    ),
    Path(
        r"C:\Users\User\.cursor\projects\d-Projects-ayolkaryera\assets"
        r"\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_"
        r"a2cda55cf7fec73f0c876a0439fe876c_images_ChatGPT_Image_Sep_15__2026__"
        r"12_11_29_PM-5937ac29-70fe-4e7b-9b26-52c4bc77d87d.jpg"
    ),
    Path(r"D:\Projects\ayolkaryera\public\images\footer\newsletter-woman.jpg"),
]

OUT = Path(r"D:\Projects\ayolkaryera\public\images\footer\newsletter-woman.png")


def is_bg(r: int, g: int, b: int) -> bool:
    return r <= 28 and g <= 28 and b <= 28 and (r + g + b) <= 55


def main() -> None:
    src = next(path for path in SRC_CANDIDATES if path.exists())
    img = Image.open(src).convert("RGBA")
    w, h = img.size
    px = img.load()

    visited = bytearray(w * h)
    queue: deque[tuple[int, int]] = deque()

    def try_push(x: int, y: int) -> None:
        idx = y * w + x
        if visited[idx]:
            return
        r, g, b, _ = px[x, y]
        if not is_bg(r, g, b):
            return
        visited[idx] = 1
        queue.append((x, y))

    for x in range(w):
        try_push(x, 0)
        try_push(x, h - 1)
    for y in range(h):
        try_push(0, y)
        try_push(w - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            try_push(x - 1, y)
        if x + 1 < w:
            try_push(x + 1, y)
        if y > 0:
            try_push(x, y - 1)
        if y + 1 < h:
            try_push(x, y + 1)

    mask = Image.new("L", (w, h), 255)
    mp = mask.load()
    for y in range(h):
        row = y * w
        for x in range(w):
            if visited[row + x]:
                mp[x, y] = 0

    mask_soft = mask.filter(ImageFilter.GaussianBlur(radius=1.2))

    # Keep face/hair interior fully opaque even if blur softened it.
    cx0, cy0 = int(w * 0.32), int(h * 0.05)
    cx1, cy1 = int(w * 0.82), int(h * 0.52)
    sp = mask_soft.load()
    for y in range(cy0, cy1):
        for x in range(cx0, cx1):
            r, g, b, _ = px[x, y]
            if not is_bg(r, g, b) and sp[x, y] < 250:
                sp[x, y] = 255

    out_img = Image.new("RGBA", (w, h))
    op = out_img.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            alpha = sp[x, y]
            if alpha < 8:
                op[x, y] = (0, 0, 0, 0)
            else:
                op[x, y] = (r, g, b, alpha)

    bbox = out_img.split()[-1].getbbox()
    if bbox:
        left, top, right, bottom = bbox
        pad = 6
        out_img = out_img.crop(
            (
                max(0, left - pad),
                max(0, top - pad),
                min(w, right + pad),
                min(h, bottom + pad),
            )
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    out_img.save(OUT, "PNG", optimize=True)
    print(f"source={src.name}")
    print(f"saved={OUT} size={out_img.size}")

    fw, fh = out_img.size
    fp = out_img.load()
    for sample in (
        (int(fw * 0.42), int(fh * 0.28)),
        (int(fw * 0.58), int(fh * 0.28)),
        (int(fw * 0.50), int(fh * 0.35)),
        (int(fw * 0.50), int(fh * 0.10)),
    ):
        print("sample", sample, fp[sample])


if __name__ == "__main__":
    main()
