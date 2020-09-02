# Seismic Data sources and scripts

## Current position and velocity data

The velocity file, which includes the location for every GPS station, can be found at data/seismic/cwu.final_nam14.vel

This data is from ftp://data-out.unavco.org/pub/products/velocity/cwu.final_nam14.vel, and fetched and cleaned
using the `fetch-velocity-data.js` script.

### Notes:

The raw data for this file is a bit confusing.

For each row for a given station, we have
* Ref epoch: all identical
* Location (Ref_X _Y _Z): all different
* Velocity (dX/dt, Y, Z): all identical
* First and last epoch: all different

What is confusing is that, from the column descriptions, it would seem that: (1) The ref_epoch should be the
date of the location data, and (2) the velocity is calculated between the first and last epochs.

But these are both clearly wrong, because we have different locations for the same ref_epoch, and same speeds
for different first_ and last_epochs.

I found a description of this file here: https://www.unavco.org/data/gps-gnss/derived-products/docs/GAGE_GPS_Analysis_Plan_20170912.pdf

> A given station may have more than one entry in a given velocity file, for example if the station is near a
> large earthquake and is affected by postseismic deformation. In this case, there will be multiple velocity
> lines in the given file, with different first_epoch and last_epoch for each entry, but will still have the
> same velocity for each entry.

...but that doesn't really explain it for me.

In any case, since we are using the file for non-milimeter position data (displaying all stations on the map)
and velocity data (which are the same on every row), this doesn't see super-important. Therefore, the file is
cleaned to remove all the additional rows for any given station.

## Position over time data

The position files, which includes the east and west delta position by date for a set of 25 GPS Stations, can
be found at data/seismic/position.[station-id].cwu.nam14.csv.

We get the data from ftp://data-out.unavco.org/pub/products/position/[station-id]/[station-id].cwu.nam14.csv

This is fetched and cleaned using the `fetch-position-data.js` script.

See also: https://www.unavco.org/data/web-services/documentation/documentation.html#!/GNSS47GPS/getPositionByStationId

## Useful links

Here's UNAVCO's own site for visualizing velocity:

https://www.unavco.org/software/visualization/GPS-Velocity-Viewer/GPS-Velocity-Viewer.html

Google Doc with some explanations of data:

https://docs.google.com/document/d/1LTuxVDAXEx4S1w12yP9REQ4nbP-mowQ1ljmvrEFrRok/edit
