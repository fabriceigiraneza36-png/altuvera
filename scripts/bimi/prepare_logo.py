#!/usr/bin/env python3
"""Create a review-only BIMI SVG candidate from the official Altuvera logo.

This script does not publish DNS, request a certificate, change DMARC, or
modify the authentication/email-sending code. It writes review artifacts only.
"""
from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw
import cairosvg
import vtracer

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "public" / "altuvera.png"
OUT = ROOT / "artifacts"
OUT.mkdir(parents=True, exist_ok=True)
PREPARED = OUT / "altuvera-square-source.png"
RAW_SVG = OUT / "altuvera-vtracer-raw.svg"
SVG_OUT = OUT / "altuvera-bimi-candidate.svg"
PREVIEW = OUT / "altuvera-bimi-preview.png"
REPORT = OUT / "validation-report.json"

SVG_NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NS)


def connected_background_to_transparency(image: Image.Image) -> tuple[Image.Image, str]:
    """Remove only a uniform edge-connected near-black matte, if one exists."""
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    alpha_min, alpha_max = alpha.getextrema()
    if alpha_min < 255:
        return rgba, "source-alpha"

    px = rgba.load()
    w, h = rgba.size
    corners = [px[0, 0][:3], px[w - 1, 0][:3], px[0, h - 1][:3], px[w - 1, h - 1][:3]]
    bg = tuple(round(sum(c[i] for c in corners) / len(corners)) for i in range(3))
    if max(bg) > 42 or max(abs(c[i] - bg[i]) for c in corners for i in range(3)) > 18:
        return rgba, "opaque-background-retained"

    # Flood-fill only background-colored pixels connected to the canvas edge.
    # This preserves dark green details enclosed inside the logo.
    seen = bytearray(w * h)
    stack = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    tolerance = 24
    while stack:
        x, y = stack.pop()
        idx = y * w + x
        if seen[idx]:
            continue
        seen[idx] = 1
        r, g, b, _ = px[x, y]
        if max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2])) > tolerance:
            continue
        px[x, y] = (r, g, b, 0)
        if x > 0: stack.append((x - 1, y))
        if x + 1 < w: stack.append((x + 1, y))
        if y > 0: stack.append((x, y - 1))
        if y + 1 < h: stack.append((x, y + 1))
    return rgba, "edge-connected-background-removed"


def prepare_square_source() -> dict:
    if not SOURCE.is_file():
        raise FileNotFoundError(f"Official source logo not found: {SOURCE}")
    original = Image.open(SOURCE).convert("RGBA")
    cleaned, background_strategy = connected_background_to_transparency(original)

    alpha = cleaned.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise ValueError("The official logo appears fully transparent.")
    cropped = cleaned.crop(bbox)

    # Place the unaltered mark, with its aspect ratio preserved, on a solid
    # white square. The padding keeps it centered inside rounded/circular inbox
    # avatars. No lettering or replacement symbol is introduced.
    canvas_size = 512
    max_mark_width = 456
    max_mark_height = 360
    scale = min(max_mark_width / cropped.width, max_mark_height / cropped.height)
    resized = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 255))
    x = (canvas_size - resized.width) // 2
    y = (canvas_size - resized.height) // 2
    canvas.alpha_composite(resized, (x, y))
    canvas.convert("RGB").save(PREPARED, format="PNG", optimize=True)
    return {
        "source_file": "public/altuvera.png",
        "source_dimensions": list(original.size),
        "source_alpha_extrema": list(original.getchannel("A").getextrema()),
        "background_handling": background_strategy,
        "visible_crop": list(bbox),
        "placed_dimensions": list(resized.size),
        "placement": [x, y],
        "canvas": [canvas_size, canvas_size],
    }


def clean_svg() -> dict:
    vtracer.convert_image_to_svg_py(
        str(PREPARED),
        str(RAW_SVG),
        colormode="color",
        hierarchical="stacked",
        mode="spline",
        filter_speckle=8,
        color_precision=4,
        layer_difference=24,
        corner_threshold=60,
        length_threshold=4.0,
        max_iterations=10,
        splice_threshold=45,
        path_precision=2,
    )

    tree = ET.parse(RAW_SVG)
    root = tree.getroot()
    if root.tag.split("}")[-1] != "svg":
        raise ValueError("Vectorizer did not produce an SVG root element.")

    # Normalize the root to the BIMI SVG Tiny PS declaration. VTracer traces
    # the supplied square PNG into vector paths; no raster <image> is retained.
    root.set("xmlns", SVG_NS)
    root.set("version", "1.2")
    root.set("baseProfile", "tiny-ps")
    root.set("viewBox", "0 0 512 512")
    root.attrib.pop("x", None)
    root.attrib.pop("y", None)
    root.attrib.pop("xmlns:xlink", None)

    # Remove editor metadata and keep a single, accessible title as the first
    # child. Paths and basic vector geometry from VTracer remain unchanged.
    for child in list(root):
        local = child.tag.split("}")[-1]
        if local in {"title", "desc", "metadata"}:
            root.remove(child)
    title = ET.Element(f"{{{SVG_NS}}}title")
    title.text = "Altuvera Safaris"
    desc = ET.Element(f"{{{SVG_NS}}}desc")
    desc.text = "Official Altuvera Safaris green mountain and wave emblem."
    root.insert(0, title)
    root.insert(1, desc)

    svg_bytes = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    SVG_OUT.write_bytes(svg_bytes)

    # Render the actual SVG for human review, not just the source PNG.
    cairosvg.svg2png(bytestring=svg_bytes, write_to=str(PREVIEW), output_width=512, output_height=512)
    rendered = Image.open(PREVIEW).convert("RGBA")
    corner_pixels = [
        rendered.getpixel((2, 2)),
        rendered.getpixel((509, 2)),
        rendered.getpixel((2, 509)),
        rendered.getpixel((509, 509)),
    ]

    parsed = ET.fromstring(svg_bytes)
    local_names = [element.tag.split("}")[-1] for element in parsed.iter()]
    forbidden_elements = sorted(set(local_names) & {
        "script", "image", "foreignObject", "a", "animate", "animateMotion",
        "animateTransform", "set", "iframe", "audio", "video"
    })
    external_refs = []
    event_attributes = []
    for element in parsed.iter():
        for key, value in element.attrib.items():
            local_key = key.split("}")[-1].lower()
            if local_key.startswith("on"):
                event_attributes.append(local_key)
            if local_key in {"href", "src"} and re.search(r"^(https?:|//|data:)", value.strip(), re.I):
                external_refs.append(value)
            if "url(" in value.lower() and not re.search(r"url\\(#[^)]+\\)", value, re.I):
                external_refs.append(value)

    viewbox = parsed.attrib.get("viewBox", "").split()
    square_viewbox = len(viewbox) == 4 and viewbox[2] == viewbox[3]
    has_single_title = sum(1 for e in parsed if e.tag.split("}")[-1] == "title") == 1
    size_bytes = SVG_OUT.stat().st_size
    corners_are_solid_white = all(pixel[0:3] == (255, 255, 255) and pixel[3] == 255 for pixel in corner_pixels)

    checks = {
        "svg_root": parsed.tag.split("}")[-1] == "svg",
        "required_namespace": parsed.attrib.get("xmlns", SVG_NS) == SVG_NS,
        "version_1_2": parsed.attrib.get("version") == "1.2",
        "base_profile_tiny_ps": parsed.attrib.get("baseProfile") == "tiny-ps",
        "square_viewbox": square_viewbox,
        "single_nonempty_title": has_single_title and bool((title.text or "").strip()),
        "no_forbidden_elements": not forbidden_elements,
        "no_external_references": not external_refs,
        "no_event_handlers": not event_attributes,
        "solid_white_canvas": corners_are_solid_white,
        "under_32_kib": size_bytes <= 32 * 1024,
    }
    return {
        "candidate_file": SVG_OUT.name,
        "svg_size_bytes": size_bytes,
        "svg_size_kib": round(size_bytes / 1024, 2),
        "vector_path_count": local_names.count("path"),
        "rendered_preview": PREVIEW.name,
        "rendered_corner_pixels_rgba": corner_pixels,
        "forbidden_elements": forbidden_elements,
        "external_references": external_refs,
        "event_handler_attributes": event_attributes,
        "checks": checks,
        "all_checks_pass": all(checks.values()),
        "certificate_or_dns_published": False,
        "production_ready": False,
        "note": (
            "Review candidate only. CMC issuer approval, DMARC alignment/enforcement, "
            "certificate PEM hosting, and BIMI DNS publication remain separate steps."
        ),
    }


def main() -> int:
    source_info = prepare_square_source()
    result = clean_svg()
    report = {"source": source_info, "validation": result}
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    # A structurally valid candidate is uploaded even if the 32 KiB or
    # other review gate fails, so it can be improved without publishing it.
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"BIMI candidate preparation failed: {exc}", file=sys.stderr)
        raise
