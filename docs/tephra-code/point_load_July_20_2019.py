from __future__ import division
import time
from math import exp, pi
from scipy.stats import norm


# !!! everything is in meters !!!
min_easting = -35000
max_easting = 35000 # in meters
min_northing = -35000
max_northing = 35000

# Define constants and variables:
vent_x = 0  # in meters
vent_y = 0
column_height = 10000  # in meters (from Volentik et al 2010)
diffusion_coef = 3000  # (from Volentik et al 2010)
wind = 0 #m/s


bulk_density = 1000
eta = 1
Mass = 4.5e+11   # total erupted mass in kg (from Volentik et al 2010)


atm_level = 500  # thickness of atmosphere layer in meters
g = 9.81  # gravitational constant m*s^-2
air_visc = 1.8325e-5                       # air viscosity in N s / m^2 at 24C
rho_p_max = 1000  # particle density Kg*m^-3
rho_p_min = 1000
rho_a_s = 1.225  # air density at sea level in Kg*m^-3

# define phi classes
phi_classes = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]
simulated_phi_classes = [0]

max_grainsize = min(phi_classes)
min_grainsize = max(phi_classes)

sigma = 2.8
mean = 1.7

particle_densities = {}
settling_velocities = {}  # list of all settling velocities
particle_mass_fractions = {}



def get_mass_fraction(phi):
    P1 = norm.cdf(phi, mean, sigma)
    P2 = norm.cdf(phi+1, mean, sigma)
    return (P2 - P1)

# functions to get particle diameter and settling velocity


def get_diameter(phi):
    return 2**(-1 * phi) * 10**-3


def get_particle_density(phi):
    if phi < max_grainsize:
        return rho_p_min
    elif phi >= max_grainsize and phi < min_grainsize:
        num = (rho_p_max - rho_p_min) * (phi - min_grainsize)
        denom = max_grainsize - min_grainsize
        return rho_p_max - (num / denom)
    else:
        return rho_p_max


def get_settling_velocity(phi):
    V_aux = 0

    for atm_layer in range(atm_level, column_height + atm_level, atm_level):
        V_layer = 0

        elev = column_height - atm_layer
        rho_a = rho_a_s * exp(-1 * elev / 8200)
        rho = get_particle_density(phi) - rho_a

        V_l = (g * get_diameter(phi)**2 * rho) / (18 * air_visc)
        V_i = get_diameter(phi) * ((4 * g**2 * rho**2) /
                                   (225 * air_visc * rho_a))**(1/3)
        V_t = ((3.1 * rho * g * get_diameter(phi))/(rho_a))**0.5

        Re_l = (get_diameter(phi) * rho_a_s * V_l) / air_visc
        Re_i = (get_diameter(phi) * rho_a_s * V_i) / air_visc
        Re_t = (get_diameter(phi) * rho_a_s * V_t) / air_visc

        if Re_l < 6:
            V_layer = V_l

        elif Re_t >= 500:
            V_layer = V_t

        else:
            V_layer = V_i

        if V_layer == V_aux:
            return V_layer
        else:
            V_aux = V_layer

    return V_layer


for phi in phi_classes:
    particle_densities[phi] = get_particle_density(phi)
    settling_velocities[phi] = get_settling_velocity(phi)
    particle_mass_fractions[phi] = get_mass_fraction(phi)

    """print('%.f, %.7f, %.3f, %.d, %.5f') % (phi, get_diameter(phi), get_settling_velocity(
        phi), get_particle_density(phi), get_mass_fraction(phi))"""

if len(simulated_phi_classes) > 1:
    Vol = Mass / (eta * bulk_density)  
else:
    phi = simulated_phi_classes[0]
    Vol = (Mass * get_mass_fraction(phi)) / (eta * get_particle_density(phi))
print "Total volume: %.2f" % (Vol)


print 'Mass:', (Mass * get_mass_fraction(simulated_phi_classes[0]))
print 'Mass fraction:', get_mass_fraction(simulated_phi_classes[0])


def calculate_tephra_load(x, y, X, Y, mass, phi):
    mass = mass * particle_mass_fractions[phi]
    settling_velocity = settling_velocities[phi]
    return (((settling_velocity * mass)/(4 * pi * column_height * diffusion_coef)) * exp(-(x - (X + wind * column_height/settling_velocity))**2/(4 * diffusion_coef * (column_height/settling_velocity)) - (((y - Y)**2)/(4 * diffusion_coef * (column_height/settling_velocity)))))


def generate_grid(min_x, max_x, min_y, max_y):
    step = int((max_x - min_x) / 100) # 100m x 100m grid
    return (
        {
            'x': x,
            'y': y
        }
        for x in range(min_x, max_x, step)
        for y in range(min_y, max_y, step)
    )


start = time.time()


out = open('xyz_point_load.txt', 'w')

grid = generate_grid(min_easting, max_easting, min_northing, max_northing)

total_mass_load = 0
for point in grid:
    # print i['x'], i['y']
    x = point['x']
    y = point['y']

    total_load = 0

    for phi in simulated_phi_classes:
            # print 'phi=', phi, 'settling velocity=', settling_velocities[phi], 'density=', particle_densities[phi]
        total_load += calculate_tephra_load(
            x, y, vent_x, vent_y, Mass, phi
        )
            
        total_mass_load += total_load


    out.write('%d %d %.6f\n' % (x, y, (total_load/bulk_density) * 100))
out.close()

print('total load', total_mass_load)
print 'Execution time:', time.time() - start, 'seconds!'
print('All data in results file!')
