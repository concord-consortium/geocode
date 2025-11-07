# Generating Elevation Maps

The molasses volcano simulation requires an elevation map of the region that might be affected by lava. Creating one of these maps is non-trivial, and the scripts in this folder help in the process. Here's a rough overview of what to do to update the map:

## 1. Get raw geotiffs

Download the geotiffs that cover the region you care about. Geotiffs can be found here: [https://earthexplorer.usgs.gov/](https://earthexplorer.usgs.gov/)

Here are instructions from ChatGPT which aren't perfect but are a good starting point:
1. Search for the region: Use the map or coordinates to zoom into the Big Island.
2. Under Data Sets, choose:
  - Digital Elevation > SRTM, or
  - 3DEP 1-meter DEM (Lidar-derived, higher resolution)
3. Select the tiles that cover the island.
4. Download in GeoTIFF format (default).

## 2. Convert geotiffs to asc files

Our javascript molasses algorithm requires an elevation map in asc format. This human readable format has a header followed by a grid with each value separated by tabs and newlines. The header contains:
- ncols - The number of columns in the file.
- nrows - The number of rows in the file.
- xllcorner - The longitude of the southwest corner of the area covered.
- yllcorner - The latitude fo the southwest corner of the area covered.
- cellsize - The length in meters of one dimension of a cell. It's assumed cells are square.
- NODATA_value - The value used to indicate missing information.

I wasn't able to convert geotiff files to asc locally. I believe it's necessary to get the low level gdal library working to do this. However, ChatGPT can pretty easily convert files for you. Just give it an example of an asc file (look in src/assets/lava-coder/elevation-maps) and ask it to convert a tif file you upload. Do this for all of the map pieces you'll need to cover the area.

## 3. Run clean-asc.py if necessary

ChatGPT will convert the files to asc, but it often makes mistakes. This script fixes several common problems:
- Sets sea level to 0 - For some reason, sea level seems to be 32768 in these files, and a few cells have values below this. `clean-asc.py` sets all values of 32768 or lower to 0, and adjusts other values as well.
- Sets correct xllcorner and yllcorner - The correct values are taken from the file name, which are usually like `n19_w156_1arc_v3.asc`. This step might not work for maps in the southern or eastern hemisphere, or if the file name does not follow this format.
- Sets cellsize to 30 - This is hard coded and may not be correct for all maps.

Run this script on all map files needed for the complete map.

## 4. Run merge-asc.py

`merge-asc.py` combines multiple map files into a single large map.
- It's assumed that all maps are the same size. If they are not, this script will fail.
- The position of each map is determined by xllcorner and yllcorner, so make sure these values are correct.
- Any blank regions are filled in with 0s, or sea level.

## 5. Run reduce-dem.py

30m cell size tends to be too fine grain a resolution for the molasses algorithm to run quickly enough. `reduce-dem.py` combines cells to reduce the resolution. The default is to reduce it by a factor of 2 (60m cells), which has worked well.

## 6. Run trim-asc.py

`trim-asc.py` removes regions of open ocean along the edges of a map. It will leave a strip of 0s along each edge so lava will disappear when it reaches that edge. It can greatly reduce the overall size of a map. This script will also update xllcorner and yllcorner properly.

## 7. Update the simulation

Your new map should be ready now, but you'll need to make a couple of changes to the codebase to actually use the new map.
1. Point to the new map in `raster.worker.ts`. Set `elevationMap` to the path to your map.
2. Update map boundaries in `lava-constants.ts`.
- `minLat` should be `yllcorner`.
- `minLong` should be `xllcorner`.
- `maxLat` should be `yllcorner` + `nrows` * `cellsize` / 108030.
- `maxLong` should be `xllcorner` + `ncols` * `cellsize` / 108030.

And with that, you're good to go!

## General tips

Throughout the process, especially early on, it can be very helpful to visualize the maps. ChatGPT is pretty good at this. Send it a file and ask it to give you a visualization. It can be particularly helpful to make sea level or lower a very distinct color. If ChatGPT is struggling to visualize the map for you, it might be too big, in which case running `reduce-dem.py` can be helpful, even reducing by a factor of 4.

# Generating Wind Data

The molasses vog simulation requires wind data to disperse vog around the island. Here's how to acquire and process new data:

## 1. Get raw csv file

1. Visit the [https://pae-paha.pacioos.hawaii.edu/erddap/griddap/wrf_hi.graph](Pacific Islands Ocean Observing System).
2. Specify a stop time (current maps are March 9, 2023 at 10am UTC (Kona) and September 30, 2025 at 10am UTC (Trade)).
3. Specify a region (current latitude values are 18.68 and 20.44 and longitude values are -156.31 and -154.51).
4. Push the Redraw the Graph button to make sure the region and wind data look good.
5. In the optional section below the Redraw the Graph button, set the file type to .csv.
6. Push the Download the Data or an Image button to get the file.

## 2. Run convert-wind.py

`convert-wind.py` will convert the `.csv` file into a `.json` file that contains a grid of wind data, along with some metadata about the latitudes and longitudes included in the grid.
1. Move the file you downloaded above into the `/scripts` directory.
2. You might want to rename the csv file to something shorter and easier to read and type.
3. Run `convert-wind.py` on the file: `python3 convert-wind.py ./wind-map.csv`.

## 3. Run interpolate-wind.py
`interpolate-wind.py` creates a more fine-grained grid by interpolating wind values throughout the grid. This results in smoother output from the dispersion simulation.
1. Run `interpolate-wind.py` on the json file output from `convert-wind.py`: `python3 interpolate-wind.py wind-map.json --scale 4`

## 4. Move the file and update the code

You'll need to make a few more changes before the wind data can actually be used.
1. Move the output file to `/src/assets/lava-coder/wind-maps`.
2. Rename the file if it would be helpful.
3. Import the data from the file in `vog-dispersion.ts`.
4. You might also need to add a new option to the `vog_wind_pattern` blockly block in `block-simulate-lava.ts` and hook that option up to the new data in `vog-dispersion.ts`.
