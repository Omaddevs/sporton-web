"""Make edge-connected white backgrounds transparent on category hero PNGs.

Matches hero-image1 style so CSS --color-card shows through in light/dark themes.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1] / "public" / "images" / "categories"
FILES = ["hero-image3.png", "hero-image5.png", "hero-image11.png"]
WHITE_MIN = 248
ERODE_ITERS = 4


def clear_white_background(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGBA"))
    rgb = arr[:, :, :3].astype(np.int16)
    white = (
        (rgb[:, :, 0] >= WHITE_MIN)
        & (rgb[:, :, 1] >= WHITE_MIN)
        & (rgb[:, :, 2] >= WHITE_MIN)
    )
    labeled, _ = ndimage.label(white)
    border = np.unique(
        np.concatenate(
            [labeled[0, :], labeled[-1, :], labeled[:, 0], labeled[:, -1]]
        )
    )
    border = border[border != 0]
    if border.size == 0:
        return Image.fromarray(arr, "RGBA")

    mask = np.isin(labeled, border)
    # Break thin anti-alias bridges into white clothing, keep largest blob
    eroded = ndimage.binary_erosion(mask, iterations=ERODE_ITERS)
    lab2, n2 = ndimage.label(eroded)
    if n2 == 0:
        return Image.fromarray(arr, "RGBA")
    sizes = [(i, int((lab2 == i).sum())) for i in range(1, n2 + 1)]
    keep_id = max(sizes, key=lambda x: x[1])[0]
    keep = lab2 == keep_id
    final = ndimage.binary_dilation(keep, iterations=ERODE_ITERS) & white
    arr[final, 3] = 0
    arr[final, 0:3] = 0
    return Image.fromarray(arr, "RGBA")


def main() -> None:
    for name in FILES:
        path = ROOT / name
        print(f"Processing {name}...")
        original = Image.open(path)
        fixed = clear_white_background(original)
        fixed.save(path, optimize=True)
        print(f"  corner={fixed.getpixel((5, 5))} saved")
    print("done")


if __name__ == "__main__":
    main()
