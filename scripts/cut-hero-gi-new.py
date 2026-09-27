"""Cut user BJJ gi JPG (baked checkerboard) to transparent hero-gi.png."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage as ndi

SRC = Path(
    r"C:\Users\4star\.cursor\projects\d-SKAWA\assets"
    r"\c__Users_4star_AppData_Roaming_Cursor_User_workspaceStorage"
    r"_3649a35abbfc622a5d4386f28aefd00f_images_image-f4a75e0d-d625-4bb1-a23f-0b935edd554b.jpg"
)
OUT = Path(__file__).resolve().parents[1] / "public" / "images" / "ref" / "hero-gi.png"
INSP = Path(__file__).resolve().parents[1] / "tmp-gi-inspect"


def main() -> None:
    INSP.mkdir(exist_ok=True)
    img = Image.open(SRC).convert("RGB")
    arr = np.asarray(img).astype(np.float32)
    h, w = arr.shape[:2]
    lum = arr.mean(2)
    chroma = arr.max(2) - arr.min(2)
    near_w = (lum > 245) & (chroma < 14)
    near_g = (lum > 195) & (lum < 218) & (chroma < 14)
    is_brand = (arr.min(2) < 80) | (
        (arr[:, :, 0] > arr[:, :, 1] + 18) & (chroma > 18) & (arr[:, :, 0] > 55)
    )

    win = 29
    frac_w = ndi.uniform_filter(near_w.astype(np.float32), size=win)
    frac_g = ndi.uniform_filter(near_g.astype(np.float32), size=win)
    # Dual-tone window = checkerboard (both white + gray tiles present)
    checker_field = (frac_w > 0.10) & (frac_g > 0.10) & ((frac_w + frac_g) > 0.48)
    pix = (near_w | near_g) & ~is_brand

    ra = np.asarray(remove(img, session=new_session("u2netp")).convert("RGBA"))[:, :, 3]
    sil = ra > 100
    lab, n = ndi.label(sil)
    sizes = np.bincount(lab.ravel())
    sizes[0] = 0
    sil = lab == int(np.argmax(sizes))

    remove_map = sil & checker_field & ~is_brand & (
        pix | ((lum > 188) & (lum < 260) & (chroma < 22))
    )
    # One more pass with slightly softer dual-tone to catch AA crumbs
    soft_field = (frac_w > 0.08) & (frac_g > 0.08) & ((frac_w + frac_g) > 0.42)
    remove_map |= sil & soft_field & pix & ~is_brand
    remove_map = ndi.binary_dilation(remove_map, iterations=2) & sil & ~is_brand

    fg = sil & ~remove_map
    fg |= is_brand & sil

    filled = ndi.binary_fill_holes(fg)
    holes = filled & ~fg
    lab, n = ndi.label(holes)
    for i in range(1, n + 1):
        comp = lab == i
        area = int(comp.sum())
        if area < 800 and (near_w[comp] | near_g[comp]).mean() < 0.5:
            fg |= comp

    restore = sil & ~fg & ~checker_field & ~soft_field
    fg |= restore
    fg |= is_brand & sil

    lab, n = ndi.label(fg)
    sizes = np.bincount(lab.ravel())
    sizes[0] = 0
    fg = lab == int(np.argmax(sizes))

    # Drop 1px dual-tone fringe
    dist = ndi.distance_transform_edt(fg)
    fringe = fg & (dist <= 1.5) & pix & soft_field & ~is_brand
    fg = fg & ~fringe

    sm = ndi.gaussian_filter(fg.astype(np.float32), 0.55)
    fg = sm >= 0.5
    lab, n = ndi.label(fg)
    sizes = np.bincount(lab.ravel())
    sizes[0] = 0
    fg = lab == int(np.argmax(sizes))

    alpha = fg.astype(np.uint8) * 255
    rgba = np.dstack([arr.astype(np.uint8), alpha])
    ys, xs = np.where(alpha > 0)
    pad = 2
    cropped = rgba[
        max(0, ys.min() - pad) : min(h, ys.max() + 1 + pad),
        max(0, xs.min() - pad) : min(w, xs.max() + 1 + pad),
    ]
    Image.fromarray(cropped, "RGBA").save(OUT, optimize=True)
    print("saved", OUT, cropped.shape[1], cropped.shape[0], int((cropped[:, :, 3] > 0).sum()))

    bg = np.zeros((cropped.shape[0], cropped.shape[1], 3), np.uint8)
    bg[:] = (200, 16, 16)
    a = cropped[:, :, 3:4].astype(np.float32) / 255
    comp = (cropped[:, :, :3].astype(np.float32) * a + bg.astype(np.float32) * (1 - a)).astype(
        np.uint8
    )
    Image.fromarray(comp).save(INSP / "comp-final-red.jpg", quality=94)


if __name__ == "__main__":
    main()
