import Everything from "./toolbox/full-toolbox.xml";
import Wind from "./toolbox/wind-toolbox.xml";
import WindAndVEI from "./toolbox/wind-vei-toolbox.xml";
import WindAndHeight from "./toolbox/wind-height-toolbox.xml";
import Wind2 from "./toolbox/wind-2-toolbox.xml";
import A4Plus5 from "./toolbox/a4-5-toolbox.xml";
import MonteCarlo from "./toolbox/monte-carlo-toolbox.xml";
import AllSeismic from "./toolbox/seismic-toolbox.xml";
import SeismicGPS from "./toolbox/seismic-gps-toolbox.xml";
import SeismicGPSGraph from "./toolbox/seismic-gps-graph-toolbox.xml";
import SeismicGPSDeformation from "./toolbox/seismic-gps-deformation-toolbox.xml";
import SeismicGPSEarthquakes from "./toolbox/seismic-gps-deformation-earthquakes-toolbox.xml";

import Basic from "./code/basic-setup.xml";
import NestedLoops from "./code/nested-loops.xml";
import MonteCarloCode from "./code/monte-carlo.xml";
import MonteCarlo3Locs from "./code/monte-carlo-3-locs.xml";
import WindDataCollection from "./code/wind-data-collection.xml";
import FilteredWindDataCollection from "./code/filter-wind-data-collection.xml";

interface IBlocklyAuthoring {
  toolbox: Record<string, string>;
  code: Record<string, string>;
  tephraToolboxes: string[];
  seismicToolboxes: string[];
}

export const BlocklyAuthoring: IBlocklyAuthoring = {
  toolbox: {
    Everything,
    Wind,
    "Wind and VEI": WindAndVEI,
    "Wind and Height": WindAndHeight,
    "Wind + 2": Wind2,
    "A4 + 5": A4Plus5,
    "Monte Carlo": MonteCarlo,
    "All Seismic": AllSeismic,
    "Seismic: GPS": SeismicGPS,
    "Seismic: GPS & Graph": SeismicGPSGraph,
    "Seismic: GPS & Deformation": SeismicGPSDeformation,
    "Seismic: GPS & Earthquakes": SeismicGPSEarthquakes
  },
  code: {
    Basic,
    "Nested loops": NestedLoops,
    "Monte Carlo": MonteCarloCode,
    "Monte Carlo (3 locs)": MonteCarlo3Locs,
    "Wind Data Collection": WindDataCollection,
    "Filtered Wind Data Collection": FilteredWindDataCollection
  },
  tephraToolboxes: [
    "Everything",
    "Wind",
    "Wind and VEI",
    "Wind and Height",
    "Wind + 2",
    "A4 + 5",
    "Monte Carlo"
  ],
  seismicToolboxes: [
    "All Seismic",
    "Seismic: GPS",
    "Seismic: GPS & Graph",
    "Seismic: GPS & Deformation",
    "Seismic: GPS & Earthquakes"
  ]
};
