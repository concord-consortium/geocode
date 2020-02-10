'''
Configuration file for pyTephra2 code with umbrella cloud geometry.
All units are in international system units (i.e. kilograms, meters, centimeters).
The user should input the simulation values for each parameter with capital letters.
In lower case letters there are physical constants that do not need change.
FOR MORE DETAILS PLEASE REFER TO THE USER MANUAL. (in pending)

AUHTORS: R. CONSTANTINESCU AND H.G. AURELIAN 
DATE: August 31, 2019
'''

OUTPUT_FILE_NAME = "low_mass.txt"

# MAP AREA AND VENT COORDINATES
MIN_EASTING = -255000
MAX_EASTING = 255000
MIN_NORTHING = -255000
MAX_NORTHING = 255000

# total number of points of the ground grid
GROUND_GRID_SIZE = 100**2

VENT_X = 0
VENT_Y = 0

# UMBRELLA CLOUD GEOMETRY PARAMETERS
DISK_RADIUS = 10000
DISK_GRID_STEP = 1000

# ERUPTION PARAMETERS
MASS = 5e+11 #mass of the total erupted tephra (i.e. mass of all phi classes)

PHI_MASS = 3.74E+09 #mass of the selected phi class if the user choses to simulate only one phi class
PHI_SETTLING_VELOCITY = 2.83

COLUMN_HEIGHT = 20000 #10185
BULK_DENSITY = 1000
PARTICLE_DENSITY_MAX = 1000 # the two densities should be the same if we assume a uniform density
PARTICLE_DENSITY_MIN = 1000
DIFFUSION_COEF = 10000

WIND_SPEED = 0 #wind only works on East and West direction by maipulating + or - sign in the tephra eq.
TGSD_SIGMA = 2.31 #these values are for Pululagua deposit
TGSD_MEAN = 0.82 #these values are for Pululagua deposit
PHI_CLASSES = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
'''
In SIMULATED_PHI_CLASSES select which phi classes you want to simulate.
By default are -7 to +7 phi. Should you simulate only one phi class, delete
and write the selected phi class (e.g. [0]).
'''
SIMULATED_PHI_CLASSES = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7]

# ATMOSPHERIC AND OTHER PHYSICAL PARAMETERS

eta = 1  # unitless
