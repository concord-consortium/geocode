# Written by ChatGPT
# This script removes blocks of ocean from the edges of a map.
# A single row or column of zeros is retained at each edge.
# xllcorner and yllcorner are adjusted correctly.

import sys

def trim_asc_file(input_path, output_path):
    with open(input_path, 'r') as f:
        lines = f.readlines()

    # Parse header
    header_lines = lines[:6]
    header = {}
    for line in header_lines:
        key, val = line.strip().split()
        header[key] = float(val) if "." in val else int(val)

    cellsize = header["cellsize"]
    nodata = int(header.get("NODATA_value", 0))
    original_nrows = header["nrows"]

    # Parse data
    data = [list(map(float, line.strip().split())) for line in lines[6:]]
    nrows = len(data)
    ncols = len(data[0]) if data else 0

    # Detect non-zero row bounds
    top, bottom = 0, nrows
    for i in range(nrows):
        if any(val != 0 for val in data[i]):
            top = max(0, i - 1)
            break
    for i in range(nrows - 1, -1, -1):
        if any(val != 0 for val in data[i]):
            bottom = min(nrows, i + 2)
            break

    # Detect non-zero column bounds
    left, right = 0, ncols
    for j in range(ncols):
        if any(row[j] != 0 for row in data):
            left = max(0, j - 1)
            break
    for j in range(ncols - 1, -1, -1):
        if any(row[j] != 0 for row in data):
            right = min(ncols, j + 2)
            break

    # Trim data
    trimmed_data = [row[left:right] for row in data[top:bottom]]
    new_nrows = len(trimmed_data)
    new_ncols = len(trimmed_data[0]) if trimmed_data else 0

    # Update coordinates
    header["nrows"] = new_nrows
    header["ncols"] = new_ncols
    header["xllcorner"] += (left * cellsize / 108030)
    header["yllcorner"] += ((original_nrows - bottom) * cellsize / 108030)

    # Write new ASC file
    with open(output_path, "w") as f:
        f.write(f"ncols         {header['ncols']}\n")
        f.write(f"nrows         {header['nrows']}\n")
        f.write(f"xllcorner     {header['xllcorner']:.8f}\n")
        f.write(f"yllcorner     {header['yllcorner']:.8f}\n")
        f.write(f"cellsize      {cellsize}\n")
        f.write(f"NODATA_value  {nodata}\n")
        for row in trimmed_data:
            f.write(" ".join(str(int(val)) if val.is_integer() else str(val) for val in row) + "\n")

    print(f"✅ Trimmed file saved to: {output_path}")

# Command-line entry point
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python trim_asc_file_no_numpy.py <input.asc> <output.asc>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    trim_asc_file(input_file, output_file)
