from __future__ import division
import time
from math import pi, exp, sqrt
from src.config import *
from src.grids import (
    generate_disk_grid,
    generate_ground_grid,
    get_disk_thickness
)
from src.tephra import (
    mass_fraction,
    particle_density,
    settling_velocity,
    tephra_load
)

# calculations start here and calculate the tephra accumulated at each (x, y) on the ground
# and released from each grid cell of the umbrella cloud, with the simulated phi class
out = open(OUTPUT_FILE_NAME, 'w')

start = time.time()

disk_grid = generate_disk_grid(VENT_X, VENT_Y, DISK_GRID_STEP, DISK_RADIUS)
ground_grid = generate_ground_grid(MIN_EASTING, MAX_EASTING, MIN_NORTHING, MAX_NORTHING)

# calculate settling_velocities and particle_mass_fractions for each phi
settling_velocities = {}
particle_mass_fractions = {}

sum_mass_fraction = 0
for phi in PHI_CLASSES:
    settling_velocities[phi] = settling_velocity(phi)
    particle_mass_fractions[phi] = mass_fraction(phi)
    sum_mass_fraction += particle_mass_fractions[phi]

# sum of all particle_mass_fractions should be 1, but it isn't
# we'll divide the mass fraction reminder to the number of phi classes and add to each phi class
mass_fraction_error = 1 - sum_mass_fraction
if mass_fraction_error > 0:
    mass_fraction_error_unit = mass_fraction_error / len(SIMULATED_PHI_CLASSES)
    for phi in PHI_CLASSES:
        particle_mass_fractions[phi] += mass_fraction_error_unit
# now, in this point, sum of all particle_mass_fractions is 1 

total_tephra_load = 0
disk_cells_count = len(disk_grid)
'''
The two lines bellow are used to change between the total erupted mass or the mass of one phi class.
If the user simulates all erupted mass (i.e. all phi classes at once), leave it like this by default.
If the user wants to simulate only one phi class, comment line 52 and uncomment line 53.
'''
disk_cell_mass = MASS / disk_cells_count 
#disk_cell_mass = PHI_MASS / disk_cells_count

for ground_point in ground_grid:
    total_load = 0

    for phi in SIMULATED_PHI_CLASSES:
        '''
        Same rule as above for simulating all mass or one phi. Comment and uncomment for each case.
        '''
        cell_mass = disk_cell_mass * particle_mass_fractions[phi]
        #cell_mass = disk_cell_mass

        for disk_grid_cell in disk_grid:
            phi_load = tephra_load(
                ground_point['x'],
                ground_point['y'],
                disk_grid_cell['x'],
                disk_grid_cell['y'],
                cell_mass,
                settling_velocities[phi]
                #PHI_SETTLING_VELOCITY # if the user chooses to input a velocity value in the config file 
                                        # when simulating one phi class uncomment this line and comment line 72.
            )
            total_load += phi_load

    total_tephra_load += total_load
    tephra_tickeness = (total_load/BULK_DENSITY) * 100  # in cm
    out.write('%d %d %.6f\n' % (ground_point['x'], ground_point['y'], tephra_tickeness))

out.close()

ground_grid_step = int((MAX_EASTING - MIN_EASTING) / sqrt(GROUND_GRID_SIZE))
ground_grid_cell_area = ground_grid_step**2
total_ground_mass = total_tephra_load * ground_grid_cell_area

print ('total_tephra_load', total_tephra_load)
print ('ground_grid_cell_area', ground_grid_cell_area)
print('total_ground_mass', total_ground_mass)


phi_mass_fraction = 0
for phi in SIMULATED_PHI_CLASSES:
    phi_mass_fraction += particle_mass_fractions[phi] * MASS

print('Simulated phi classes: {}'.format(str(SIMULATED_PHI_CLASSES)))
for phi in SIMULATED_PHI_CLASSES:
    print('{}'.format(particle_mass_fractions[phi]))
print('Total erupted mass: {} kg'.format(MASS))
print('Phi mass fraction: {} kg'.format(phi_mass_fraction))
#print('Phi mass fraction: {} kg'.format(PHI_MASS))
print('Ground mass load: {} kg'.format(total_ground_mass))
print('Mass error: {:.8f}%'.format(100 - (total_ground_mass * 100) / phi_mass_fraction))
#print('Mass error: {:.8f}%'.format(100 - (total_ground_mass * 100) / PHI_MASS))
print('Ground grid resolution: {}x{} m'.format(ground_grid_step, ground_grid_step))
print('Disk radius: {} m'.format(DISK_RADIUS))
print('Disk grid resolution: {}x{} m'.format(DISK_GRID_STEP, DISK_GRID_STEP))
print('Disk grid cell count: {}'.format(len(disk_grid)))
print('Disk grid cell mass: {} kg'.format(disk_cell_mass))
print('Disk thickness: {:.5f} m'.format(get_disk_thickness()))

print('Execution time: {:.2f} s'.format(time.time() - start))
print('Results are stored in: {}'.format(OUTPUT_FILE_NAME))
