#!/usr/bin/env python3
"""
Written by ChatGPT

Input JSON format (from csv_to_uv_grid_no_time.py):
{
  "lats": [ ... ascending ... ],
  "lons": [ ... ascending ... ],
  "grid": [[[U,V], ... per lon], ... per lat],
  "meta": {...}
}

This script upsamples the grid by an integer --scale using bilinear interpolation.
Missing input cells (null) are handled with sensible fallbacks:
- If 2/4 corners exist along one axis, do 1D linear interpolation on that axis.
- If only 1 corner exists, use that (nearest).
- If none exist (rare if input has any data), leave as null.

Output JSON preserves structure with new lats/lons/grid and notes the scale in meta.
No NumPy, no Pandas.
"""

import argparse
import json
from pathlib import Path
from math import inf

def lerp(a, b, t):
    return a + (b - a) * t

def lerp_pair(p0, p1, t):
    # p0/p1 are [u, v] or None
    if p0 is None and p1 is None:
        return None
    if p0 is None:
        return p1
    if p1 is None:
        return p0
    return [lerp(p0[0], p1[0], t), lerp(p0[1], p1[1], t)]

def bilerp(c00, c10, c01, c11, fx, fy):
    """
    Bilinear interpolation of 2D vectors.
    Corners:
      c00 = (i,   j  )
      c10 = (i+1, j  )
      c01 = (i,   j+1)
      c11 = (i+1, j+1)
    fx in [0,1] across lon; fy in [0,1] across lat.
    Handles Nones by degrading to 1D lerp or nearest.
    """
    # If all corners present: standard bilinear
    if all(c is not None for c in (c00, c10, c01, c11)):
        top = lerp_pair(c00, c01, fx)
        bot = lerp_pair(c10, c11, fx)
        return lerp_pair(top, bot, fy)

    # Try to interpolate along axes where both neighbors exist
    # Along lon at top row:
    top = None
    if c00 is not None or c01 is not None:
        top = lerp_pair(c00, c01, fx)

    # Along lon at bottom row:
    bot = None
    if c10 is not None or c11 is not None:
        bot = lerp_pair(c10, c11, fx)

    if top is not None and bot is not None:
        return lerp_pair(top, bot, fy)
    if top is not None:
        return top
    if bot is not None:
        return bot

    # Try along lat (same column)
    left = None
    if c00 is not None or c10 is not None:
        left = lerp_pair(c00, c10, fy)
    right = None
    if c01 is not None or c11 is not None:
        right = lerp_pair(c01, c11, fy)
    if left is not None and right is not None:
        return lerp_pair(left, right, fx)
    if left is not None:
        return left
    if right is not None:
        return right

    # Fallback: nearest of any available corner
    for cand, wx, wy in ((c00, 1-fx, 1-fy), (c01, fx, 1-fy), (c10, 1-fx, fy), (c11, fx, fy)):
        if cand is not None:
            return cand
    return None

def nearest_from_original(i0, j0, orig_grid):
    """
    Fallback nearest neighbor search in original grid if everything else failed.
    Returns [u, v] or None.
    """
    h = len(orig_grid)
    w = len(orig_grid[0]) if h else 0
    best = None
    best_d2 = inf
    for i in range(h):
        row = orig_grid[i]
        for j in range(w):
            val = row[j]
            if val is None:
                continue
            d2 = (i - i0) * (i - i0) + (j - j0) * (j - j0)
            if d2 < best_d2:
                best_d2 = d2
                best = val
    return best

def main():
    ap = argparse.ArgumentParser(description="Upsample a lat×lon [U,V] JSON grid by integer scale using bilinear interpolation.")
    ap.add_argument("input_json", help="Path to input JSON produced by csv_to_uv_grid_no_time.py")
    ap.add_argument("--scale", type=int, default=2, help="Upsampling factor (integer ≥2). Default: 2")
    ap.add_argument("--out", help="Optional output file path (defaults to <input-stem>_xS.json)")
    args = ap.parse_args()

    if args.scale < 2:
        raise SystemExit("--scale must be an integer ≥ 2")

    in_path = Path(args.input_json)
    if not in_path.exists():
        raise SystemExit(f"Input not found: {in_path}")

    with in_path.open("r", encoding="utf-8") as f:
        src = json.load(f)

    lats = src.get("lats")
    lons = src.get("lons")
    grid = src.get("grid")

    if not isinstance(lats, list) or not isinstance(lons, list) or not isinstance(grid, list):
        raise SystemExit("Input JSON missing required arrays: lats, lons, grid")

    H = len(lats)
    W = len(lons)
    if H == 0 or W == 0:
        raise SystemExit("Empty lats/lons")
    if len(grid) != H or any(len(row) != W for row in grid):
        raise SystemExit("grid shape does not match lats/lons")

    s = args.scale

    # New coordinates: subdivide each interval linearly (works with irregular spacing)
    new_lats = []
    for i in range(H - 1):
        a, b = lats[i], lats[i + 1]
        for k in range(s):
            t = k / s
            new_lats.append(a + (b - a) * t)
    new_lats.append(lats[-1])

    new_lons = []
    for j in range(W - 1):
        a, b = lons[j], lons[j + 1]
        for k in range(s):
            t = k / s
            new_lons.append(a + (b - a) * t)
    new_lons.append(lons[-1])

    Hn = (H - 1) * s + 1
    Wn = (W - 1) * s + 1

    # Convenience accessor for original corners; original may have nulls → convert to None.
    orig = [[(cell if (isinstance(cell, list) and len(cell) == 2) else None) for cell in row] for row in grid]

    new_grid = [[None for _ in range(Wn)] for _ in range(Hn)]

    # For each new index (I,J), identify the original cell and interpolate
    for I in range(Hn):
        i = min((I // s), H - 2) if I < Hn - 1 else H - 2
        fy = (I - i * s) / s if I < Hn - 1 else 1.0  # 1.0 at the last row

        for J in range(Wn):
            j = min((J // s), W - 2) if J < Wn - 1 else W - 2
            fx = (J - j * s) / s if J < Wn - 1 else 1.0  # 1.0 at the last col

            c00 = orig[i][j]
            c01 = orig[i][j + 1]
            c10 = orig[i + 1][j]
            c11 = orig[i + 1][j + 1]

            val = bilerp(c00, c10, c01, c11, fx, fy)
            if val is None:
                # As a last resort, use nearest from the original grid based on (i,j) mapping
                val = nearest_from_original(round(I / s), round(J / s), orig)
            new_grid[I][J] = val  # may still be None if input is empty everywhere

    out_path = Path(args.out) if args.out else in_path.with_name(in_path.stem + f"_x{args.scale}.json")

    payload = {
        "lats": new_lats,
        "lons": new_lons,
        "grid": new_grid,
        "meta": {
            **(src.get("meta") or {}),
            "source_file": str(in_path),
            "interpolation": "bilinear with fallbacks",
            "scale": s,
            "original_shape": [H, W, 2],
            "new_shape": [Hn, Wn, 2],
            "notes": "Coordinates subdivided linearly between original points; missing inputs interpolated when possible, otherwise nearest fill."
        }
    }

    with out_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"Saved: {out_path}")
    print(f"New grid shape: (n_lat={Hn}, n_lon={Wn}, 2)")

if __name__ == "__main__":
    main()
