#!/usr/bin/env python3
"""
Written by ChatGPT

Reads a CSV/TSV like:
  time, latitude, longitude, Uwind, Vwind
(with a second "units" row to skip)
IGNORES the 'time' column entirely.

Outputs ONE JSON:
  <stem>_uv.json
containing:
{
  "lats": [ ...ascending... ],
  "lons": [ ...ascending... ],
  "grid": [[[U,V], ... per lon], ... per lat]  # shape (n_lat, n_lon, 2)
}
"""

import argparse
import csv
import json
from pathlib import Path

def sniff_dialect(path):
    sample = Path(path).read_bytes()[:4096].decode("utf-8", errors="ignore")
    try:
        return csv.Sniffer().sniff(sample, delimiters=[",", "\t", ";", " "])
    except Exception:
        # Heuristic: tabs in header → TSV; else comma
        header = sample.splitlines()[0] if sample else ""
        if "\t" in header:
            class _TSV(csv.excel_tab): pass
            return _TSV()
        return csv.excel

def safe_float(x):
    try:
        return float(x)
    except Exception:
        return None

def main():
    ap = argparse.ArgumentParser(description="Convert wind CSV to a lat×lon [U,V] grid (ignoring time).")
    ap.add_argument("csv", help="Path to input CSV/TSV with a units row.")
    ap.add_argument("--out", help="Optional output stem or filename (suffix ignored). Defaults to input stem.")
    args = ap.parse_args()
    print("--- starting")

    in_path = Path(args.csv)
    if not in_path.exists():
        raise SystemExit(f"Input not found: {in_path}")

    # Output stem
    if args.out:
        out_stem = Path(args.out)
        if out_stem.suffix:
            out_stem = out_stem.with_suffix("")
    else:
        out_stem = in_path.with_suffix("")

    dialect = sniff_dialect(in_path)
    rows = []
    with in_path.open(newline="", encoding="utf-8") as f:
        reader = csv.reader(f, dialect)
        try:
            header = next(reader)
        except StopIteration:
            raise SystemExit("Empty file.")

        header = [h.strip() for h in header]
        # Required columns (case-insensitive); time is optional/ignored
        need = ["latitude", "longitude", "Uwind", "Vwind"]
        idx = {}
        for want in need:
            try:
                idx[want] = next(i for i, h in enumerate(header) if h.lower() == want.lower())
            except StopIteration:
                raise SystemExit(f"Missing required column: {want}")

        # Attempt to skip units row
        print("--- Skipping units row")
        try:
            units = next(reader)
            lat_val = units[idx["latitude"]] if len(units) > max(idx.values()) else None
            if not (lat_val is not None and safe_float(lat_val) is None):
                # Not a units row → treat as data
                rows.append(units)
        except StopIteration:
            pass
        print(" -- skipped units row")

        for r in reader:
            if not r or all((c or "").strip() == "" for c in r):
                continue
            rows.append(r)

    # Parse usable rows (ignore time completely)
    data = []
    for r in rows:
        # pad/truncate
        r = list(r) + [""] * (len(header) - len(r))
        lat = safe_float((r[idx["latitude"]] or "").strip())
        lon = safe_float((r[idx["longitude"]] or "").strip())
        uw  = safe_float((r[idx["Uwind"]]    or "").strip())
        vw  = safe_float((r[idx["Vwind"]]    or "").strip())
        if (lat is not None) and (lon is not None) and (uw is not None) and (vw is not None):
            data.append((lat, lon, uw, vw))

    if not data:
        raise SystemExit("No valid data rows found.")

    # Unique sorted coords
    lats = sorted({lat for lat, _, _, _ in data})
    lons = sorted({lon for _, lon, _, _ in data})

    # Index maps
    lat_idx = {v: i for i, v in enumerate(lats)}
    lon_idx = {v: j for j, v in enumerate(lons)}

    # Initialize grid with nulls
    grid = [[[None, None] for _ in lons] for _ in lats]

    # Fill (last write wins if duplicates)
    for lat, lon, u, v in data:
        i = lat_idx[lat]
        j = lon_idx[lon]
        grid[i][j] = [u, v]

    # Write single JSON payload
    out_file = out_stem.with_name(out_stem.name + "_uv.json")
    payload = {
        "lats": lats,
        "lons": lons,
        "grid": grid,
        "meta": {
            "grid_shape": [len(lats), len(lons), 2],
            "ordering": "lat ascending, then lon ascending",
            "cell": "[Uwind, Vwind]",
            "missing": "null",
            "time": "ignored"
        }
    }
    with out_file.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print("Done.")
    print(f"Saved: {out_file}")
    print(f"Grid shape: (n_lat={len(lats)}, n_lon={len(lons)}, 2). Each cell is [Uwind, Vwind]. Time column ignored.")

if __name__ == "__main__":
    main()
