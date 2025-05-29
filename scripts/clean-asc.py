# Written by ChatGPT
# This script cleans up an ASC file converted by ChatGPT, correcting some regular problems:
# - It uses the filename to determine the xllcorner and yllcorner values.
# - It sets cellsize to 30. The default value is 1arc, which is equal to 30m.
# - It subtracts 32768 (which seems to be sea level for some reason) from each value and floors it at 0.

import os
import sys

def parse_coords_from_filename(filename):
    base = os.path.basename(filename).lower()
    parts = base.split('_')
    north = next(p for p in parts if p.startswith('n'))
    west = next(p for p in parts if p.startswith('w'))
    yllcorner = int(north[1:])
    xllcorner = -int(west[1:])
    return xllcorner, yllcorner

def convert_asc_file(input_path, output_path):
    with open(input_path, 'r') as f:
        lines = f.readlines()

    header = lines[:6]
    data_lines = lines[6:]

    # Extract metadata
    ncols = int(header[0].split()[1])
    nrows = int(header[1].split()[1])
    nodata_value = float(header[5].split()[1])

    # Get corrected geographic metadata
    xllcorner, yllcorner = parse_coords_from_filename(input_path)

    # Process data: subtract 32768, floor at 0
    processed_data = []
    for line in data_lines:
        values = [float(v) for v in line.strip().split()]
        adjusted = [max(v - 32768, 0) for v in values]
        processed_data.append(adjusted)

    # Write to new file
    with open(output_path, 'w') as f:
        f.write(f"ncols         {ncols}\n")
        f.write(f"nrows         {nrows}\n")
        f.write(f"xllcorner     {xllcorner}\n")
        f.write(f"yllcorner     {yllcorner}\n")
        f.write(f"cellsize      30\n")
        f.write(f"NODATA_value  {nodata_value:.6f}\n")
        for row in processed_data:
            f.write(" ".join(f"{val:.6f}" for val in row) + "\n")

    print(f"Converted: {output_path}")

# Example usage:
# python convert_asc_file_no_numpy.py input.asc output.asc
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_asc_file_no_numpy.py input.asc output.asc")
        sys.exit(1)

    convert_asc_file(sys.argv[1], sys.argv[2])
