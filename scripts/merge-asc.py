# Written by ChatGPT
# This script combines multiple ASC files into a single ASC file.
# The position of each file is determined by its xllcorner and yllcorner values.
# It assumes that all files have the same number of columns and rows and have the same cell size.
# Any blank areas of the complete map are filled with zeros.

import sys

def parse_header_and_data(path):
    with open(path, 'r') as f:
        header = {}
        for _ in range(6):
            line = f.readline()
            key, val = line.strip().split(maxsplit=1)
            header[key.lower()] = float(val) if '.' in val or 'e' in val.lower() else int(val)
        data = [list(map(float, line.strip().split())) for line in f]
    return header, data

def stitch_asc_files(input_paths, output_path):
    files = []
    for path in input_paths:
        header, data = parse_header_and_data(path)
        files.append((header, data))

    # Assume consistent cellsize
    cellsize = files[0][0]['cellsize']

    # Determine bounding box in terms of x/y coordinates
    x_coords = [f[0]['xllcorner'] for f in files]
    y_coords = [f[0]['yllcorner'] for f in files]
    width = files[0][0]['ncols'] # Assume all files have the same width
    height = files[0][0]['nrows'] # Assume all files have the same height

    x_min = min(x_coords)
    y_min = min(y_coords)
    x_max = max(x_coords)
    y_max = max(y_coords)
    x_range = x_max - x_min
    y_range = y_max - y_min

    ncols = (x_range + 1) * width
    nrows = (y_range + 1) * height

    # Initialize blank grid filled with zeros
    merged = [[0.0 for _ in range(ncols)] for _ in range(nrows)]

    for header, data in files:
        print(f"Filling in section at {header['xllcorner']}, {header['yllcorner']}")
        dx = (header['xllcorner'] - x_min) * width
        dy = (y_max - header['yllcorner']) * height
        for row_index, row in enumerate(data):
            for col_index, value in enumerate(row):
                merged[dy + row_index][dx + col_index] = value

    # Write output file
    with open(output_path, 'w') as f:
        f.write(f"ncols         {ncols}\n")
        f.write(f"nrows         {nrows}\n")
        f.write(f"xllcorner     {x_min}\n")
        f.write(f"yllcorner     {y_min}\n")
        f.write(f"cellsize      {cellsize}\n")
        f.write(f"NODATA_value  -9999\n")
        for row in merged:
            f.write(" ".join(f"{val}" for val in row) + "\n")

    print(f"Stitched output written to {output_path}")

# Example usage:
# python stitch_asc_files.py file1.asc file2.asc file3.asc output.asc
if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python stitch_asc_files.py file1.asc file2.asc ... output.asc")
        sys.exit(1)

    input_paths = sys.argv[1:-1]
    output_path = sys.argv[-1]
    stitch_asc_files(input_paths, output_path)
