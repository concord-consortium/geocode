from __future__ import division
from scipy.stats import norm
from math import exp, pi
from src.config import (
    COLUMN_HEIGHT,
    PHI_CLASSES,
    PARTICLE_DENSITY_MIN,
    PARTICLE_DENSITY_MAX,
    TGSD_MEAN,
    TGSD_SIGMA,
    DIFFUSION_COEF,
    WIND_SPEED
)

# 500 m thick slices
atmosphere_level_step = 500

# density at sea level in Kg*m^-3
rho_a_s = 1.225

# gravitational constant m*s^-2
g = 9.81

# air viscosity in N s / m^2 at 24C
air_visc = 1.8325e-5


def particle_density(phi):
    '''
    ...
    '''
    max_grainsize = min(PHI_CLASSES)
    min_grainsize = max(PHI_CLASSES)

    if phi < max_grainsize:
        return PARTICLE_DENSITY_MIN
    elif phi >= max_grainsize and phi < min_grainsize:
        num = (PARTICLE_DENSITY_MAX - PARTICLE_DENSITY_MIN) * (phi - min_grainsize)
        denom = max_grainsize - min_grainsize
        return PARTICLE_DENSITY_MAX - (num / denom)
    else:
        return PARTICLE_DENSITY_MAX


# function to get the mass fraction of each phi class from total mass
def mass_fraction(phi):
    P1 = norm.cdf(phi, TGSD_MEAN, TGSD_SIGMA)
    P2 = norm.cdf(phi + 1, TGSD_MEAN, TGSD_SIGMA)
    return P2 - P1


def particle_diameter(phi):
    return 2**(-1 * phi) * 10**-3


def settling_velocity(phi):
    V_aux = 0

    for atm_layer in range(atmosphere_level_step, COLUMN_HEIGHT + atmosphere_level_step, atmosphere_level_step):
        V_layer = 0

        elev = COLUMN_HEIGHT - atm_layer
        rho_a = rho_a_s * exp(-1 * elev / 8200)
        rho = particle_density(phi) - rho_a

        V_l = (g * particle_diameter(phi)**2 * rho) / (18 * air_visc)
        V_i = particle_diameter(phi) * ((4 * g**2 * rho**2) / (225 * air_visc * rho_a))**(1/3)
        V_t = ((3.1 * rho * g * particle_diameter(phi))/(rho_a))**0.5

        Re_l = (particle_diameter(phi) * rho_a * V_l) / air_visc
        Re_i = (particle_diameter(phi) * rho_a * V_i) / air_visc
        Re_t = (particle_diameter(phi) * rho_a * V_t) / air_visc

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


# function to calculate tephra load at an (x, y) location on the ground
# TODO: find better names for tephra_load method
def tephra_load(x, y, X, Y, mass, velocity):
    '''
    comment here
    '''
    source_term = (velocity * mass) / (4 * pi * COLUMN_HEIGHT * DIFFUSION_COEF)
    denom = 4 * DIFFUSION_COEF * (COLUMN_HEIGHT/velocity)
    advection = (x - (X + WIND_SPEED * COLUMN_HEIGHT / velocity))**2 / denom
    diffusion = (y - Y)**2 / denom

    return source_term * exp(-advection - diffusion)
