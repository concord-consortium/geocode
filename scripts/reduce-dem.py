# Written by ChatGPT
# This script downsamples a DEM (Digital Elevation Model) in ASC format.
import argparse

def parse_asc(file_path):
    header = {}

    with open(file_path, 'r') as f:
        for _ in range(6):
            line = f.readline()
            key, value = line.strip().split()
            header[key.lower()] = float(value) if '.' in value or 'e' in value.lower() else int(value)

        row = []
        for line in f:
            for value in line.strip().split():
                row.append(float(value))
        nrows = header['nrows']
        ncols = header['ncols']

    # Convert flat list to 2D list (list of lists)
    array = [row[i * ncols:(i + 1) * ncols] for i in range(nrows)]
    return header, array

def write_asc(file_path, header, array):
    with open(file_path, 'w') as f:
        f.write(f"ncols         {header['ncols']}\n")
        f.write(f"nrows         {header['nrows']}\n")
        f.write(f"xllcorner     {header['xllcorner']}\n")
        f.write(f"yllcorner     {header['yllcorner']}\n")
        f.write(f"cellsize      {header['cellsize'] * header['factor']}\n")
        f.write(f"NODATA_value  {header['nodata_value']}\n")
        for row in array:
            f.write(' '.join(str(int(val)) if val.is_integer() else str(val) for val in row) + '\n')

def downsample(array, factor, method, nodata):
    old_rows = len(array)
    old_cols = len(array[0])

    new_rows = old_rows // factor
    new_cols = old_cols // factor

    result = []

    for i in range(new_rows):
        row = []
        for j in range(new_cols):
            values = []
            for di in range(factor):
                for dj in range(factor):
                    val = array[i * factor + di][j * factor + dj]
                    if val != nodata:
                        values.append(val)

            if not values:
                combined = nodata
            elif method == 'average':
                combined = sum(values) / len(values)
            elif method == 'max':
                combined = max(values)
            else:
                raise ValueError("Method must be 'average' or 'max'.")

            row.append(combined)
        result.append(row)

    return result

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True, help='Input ASC file')
    parser.add_argument('--output', required=True, help='Output ASC file')
    parser.add_argument('--factor', type=int, default=2, help='Downsample factor (default 2)')
    parser.add_argument('--method', choices=['average', 'max'], default='average', help='How to combine cells')
    args = parser.parse_args()

    header, array = parse_asc(args.input)

    downsampled = downsample(array, args.factor, args.method, header['nodata_value'])

    new_header = header.copy()
    new_header['nrows'] = len(downsampled)
    new_header['ncols'] = len(downsampled[0])
    new_header['factor'] = args.factor

    write_asc(args.output, new_header, downsampled)

    print(f"Downsampled file written to {args.output}")

if __name__ == '__main__':
    main()
