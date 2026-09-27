"""Cut the SKAWA campaign athlete out of his dark gym so he can sit on the light homepage hero.

Requires rembg (pip install "rembg[cpu]" pillow). Writes the lossless PNG next to the source;
convert it to public/images/campaign/hero-fighter-back-cut.webp, then run:
    node scripts/build-home-assets.mjs
"""
import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "images" / "campaign" / "hero-fighter-back.jpg"
OUT = SRC.with_name("hero-fighter-back-cut.png")

model = sys.argv[1] if len(sys.argv) > 1 else "isnet-general-use"
session = new_session(model)
cut = remove(Image.open(SRC).convert("RGB"), session=session, post_process_mask=True)
cut.save(OUT)
print("saved", OUT, cut.size)
