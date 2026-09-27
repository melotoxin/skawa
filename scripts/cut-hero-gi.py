"""Cut the gi and keep the pant columns while dropping the floor wash."""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

src = np.asarray(Image.open("public/images/products/bjj-gi-white.png").convert("RGB")).astype(np.float32)
h, w = src.shape[:2]
lum = src.mean(axis=2)
mean = ndimage.uniform_filter(lum, size=3)
std = np.sqrt(np.clip(ndimage.uniform_filter(lum * lum, size=3) - mean * mean, 0, None))

plate = ((np.abs(src - 240).max(axis=2) < 9) & (std < 1.6)) | ((np.abs(src - 240).max(axis=2) < 22) & (std < 1.05))
labels, _ = ndimage.label(plate)
border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
border = border[border != 0]
gi = ~np.isin(labels, border)
labels, _ = ndimage.label(gi)
sizes = np.bincount(labels.ravel())
sizes[0] = 0
gi = labels == sizes.argmax()

def runs(row):
    on = np.where(row)[0]
    if len(on) == 0:
        return []
    found = []
    start = int(on[0])
    for i in range(1, len(on) + 1):
        if i == len(on) or on[i] > on[i - 1] + 1:
            found.append((start, int(on[i - 1])))
            if i < len(on):
                start = int(on[i])
    return found

# Pant columns from a row above the floor wash. Keep the two widest runs.
sample = runs(gi[1000])
sample = sorted(sample, key=lambda r: r[1] - r[0], reverse=True)[:2]
sample.sort()
print("pant columns", sample)
pad = 8
spans = [(max(0, a - pad), min(w - 1, b + pad)) for a, b in sample]

y0 = 1040
hem = runs(gi[1090])
hem = sorted(hem, key=lambda r: r[1] - r[0], reverse=True)[:2]
print("hem columns", hem)
for y in range(y0, h):
    row = gi[y]
    use = hem if y > 1110 else sample
    spans = [(max(0, a - 6), min(w - 1, b + 6)) for a, b in use]
    for a, b in runs(row):
        center = (a + b) / 2
        if not any(s0 <= center <= s1 for s0, s1 in spans):
            gi[y, a:b + 1] = False
            continue
        span = next(s for s in spans if s[0] <= center <= s[1])
        if a < span[0]:
            gi[y, a:span[0]] = False
        if b > span[1]:
            gi[y, span[1] + 1:b + 1] = False
ys = np.arange(h)[:, None]
shelf = (ys > 1125) & (std < 1.8) & (lum > 218)
gi[shelf] = False

holes, n_holes = ndimage.label(~gi)
edge_ids = set(np.unique(np.concatenate([holes[0], holes[-1], holes[:, 0], holes[:, -1]])))
for i in range(1, n_holes + 1):
    if i not in edge_ids:
        gi[holes == i] = True

gi = ndimage.binary_erosion(gi, iterations=2)
gi = ndimage.gaussian_filter(gi.astype(np.float32), 0.5) > 0.52
specks, _ = ndimage.label(gi)
speck_sizes = np.bincount(specks.ravel())
gi[speck_sizes[specks] < 250] = False

# One straight cut under the hems. The contact shadow is the first
# dark band below the bright cuff cloth.
cut_at = None
for y in range(h - 1, int(h * 0.88), -1):
    parts = [gi[y, a:b + 1] for a, b in sample]
    mask = np.concatenate(parts)
    if int(mask.sum()) < 40:
        continue
    vals = np.concatenate([lum[y, a:b + 1] for a, b in sample])
    if float(np.median(vals[mask])) >= 205:
        cut_at = y
        break
print("hem cut", cut_at)
if cut_at is not None:
    gi[cut_at - 8:] = False

alpha = gi.astype(np.uint8) * 255
rgba = np.dstack([np.clip(src, 0, 255).astype(np.uint8), alpha])
image = Image.fromarray(rgba, "RGBA")
bbox = image.getbbox()
image = image.crop(bbox)

image.save("public/images/ref/hero-gi.png")
out = Path("tmp-gi-inspect")
out.mkdir(exist_ok=True)
image.save(out / "preview-gi.png")
dark = Image.new("RGBA", image.size, (16, 16, 18, 255))
comp = Image.alpha_composite(dark, image).convert("RGB")
comp.save(out / "preview-dark.jpg", quality=92)
comp.crop((8, image.size[1] - 260, image.size[0] - 8, image.size[1])).save(out / "preview-cuffs.jpg", quality=95)
comp.crop((0, 200, 190, 500)).save(out / "preview-sleeve.jpg", quality=95)
comp.crop((max(0, image.size[0] - 230), 100, image.size[0], 460)).save(out / "preview-sleeve-r.jpg", quality=95)
print("preview", image.size)
