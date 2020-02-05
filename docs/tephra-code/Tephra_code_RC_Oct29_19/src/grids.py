from __future__ import division
from math import sqrt, pi
from src.tephra import mass_fraction, particle_density
from src.config import (
    MASS,
    SIMULATED_PHI_CLASSES,
    PHI_CLASSES,
    BULK_DENSITY,
    DISK_RADIUS,
    DISK_GRID_STEP,
    VENT_X,
    VENT_Y,
    GROUND_GRID_SIZE,
    eta
)


def get_volume():
    if len(SIMULATED_PHI_CLASSES) > 1:
        disk_volume = MASS / (eta * BULK_DENSITY)
    else:
        phi = SIMULATED_PHI_CLASSES[0]
        disk_volume = (MASS * mass_fraction(phi)) / (eta * particle_density(phi))

    return disk_volume


def get_disk_thickness():
    disk_volume = get_volume()
    return disk_volume / (pi * DISK_RADIUS**2)


def distance_between_points(point1_x, point1_y, point2_x, point2_y):
    return sqrt((point2_x - point1_x)**2 + (point2_y - point1_y)**2)


# functions to define the umbrella cloud as disk discretized in equally spaced grid cells
def generate_disk_grid(center_x, center_y, grid_step, disk_radius):
    grid_cells = []

    for i in range(grid_step, 2 * disk_radius + grid_step, grid_step):
        for j in range(grid_step, 2 * disk_radius + grid_step, grid_step):
            grid_cell = {
                'x': center_x - disk_radius + i - grid_step/2,
                'y': center_y - disk_radius + j - grid_step/2
            }

            if distance_between_points(grid_cell['x'], grid_cell['y'], center_x, center_y) <= disk_radius:
                grid_cells.append(grid_cell)

    return grid_cells


# function to define the grid on which tephra load will be calculated on the ground
# the function is automatically splitting the map in 10000 grid cells given any map corners
def generate_ground_grid(min_x, max_x, min_y, max_y):
    '''
    Obs: for ground grid we'll use python generators in order to avoid keeping all points in memory 
    '''
    step = int((max_x - min_x) / sqrt(GROUND_GRID_SIZE))

    return (
        {
            'x': x,
            'y': y
        }
        for x in range(min_x, max_x, step)
        for y in range(min_y, max_y, step)
    )
