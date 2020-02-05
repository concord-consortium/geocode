'''
Script to plot distance vs. thickness data. 
Input files have to be in the same folder with the script.
Axes are in meters (X) and centimeters (Y).
Change the legend and the disk radius accordingly in the plot properties section.
The script can plot 1 set of scatter data and 6 lines. Comment unnecessary sections.

AUHTORS: R. CONSTANTINESCU 
DATE: September 2, 2019
'''

from math import sqrt
import matplotlib.pyplot as plt
import numpy as np

vent_x = 0
vent_y = 0

########## PULULAGUA DATA ######################################################

x, y = [], []

# for line in open('Pululagua_0phi.txt', 'r'):
#   values = [float(s) for s in line.split()]
#   x.append(values[0] * 1000) #Km to m
#   y.append(values[1])

# with open('Pululagua_4phi.txt', 'r') as f:
#   lines = f.read().splitlines()
#   for line in lines:
#     values = [float(s) for s in line.split()]
#     x.append(values[0] * 1000) #Km to m
#     y.append(values[1])

# #print min(x), min(y)
# #print max(x), max(y)
# plt.scatter(x, y, marker = 'x',s = 12, color = 'g', label="4 phi field data")
  
################## PLOT LINE 1 #################################################

x, y, z = np.genfromtxt(r'high_mass.txt', unpack=True)

X = []
Z = []
for idx, lon in enumerate(x):
    if lon >= vent_x and y[idx] == vent_y and z[idx] > 0.000001:
      distance_from_vent = sqrt((vent_x - lon)**2 + (vent_y - y[idx])**2)
      X.append(distance_from_vent)
      Z.append(z[idx])
#print min(Z)
        
plt.plot(X,Z, color='orange', label="Low mass ", linewidth = 0.8)

################## PLOT LINE 2 #################################################

x, y, z = np.genfromtxt(r'high_mass+wind.txt', unpack=True)

X = []
Z = []
for idx, lon in enumerate(x):
    if lon >= vent_x and y[idx] == vent_y and z[idx] > 0.000001:
      distance_from_vent = sqrt((vent_x - lon)**2 + (vent_y - y[idx])**2)
      X.append(distance_from_vent)
      Z.append(z[idx])
#print min(Z)
        
plt.plot(X,Z, color='red', label="Low mass + wind (5 m/s)", linestyle='--', linewidth = 0.9)

# ################## PLOT LINE 3 #################################################

x, y, z = np.genfromtxt(r'low_mass.txt', unpack=True)

X = []
Z = []
for idx, lon in enumerate(x):
    if lon >= vent_x and y[idx] == vent_y and z[idx] > 0.000001:
      distance_from_vent = sqrt((vent_x - lon)**2 + (vent_y - y[idx])**2)
      X.append(distance_from_vent)
      Z.append(z[idx])
#print min(Z)
        
plt.plot(X,Z, color='black', label="High mass", linewidth = 0.8)

################### PLOT LINE 4 ############################################################

# x, y, z = np.genfromtxt(r'xyz_4phi_Vd3.txt', unpack=True)

# X = []
# Z = []
# for idx, lon in enumerate(x):
#     if lon >= vent_x and y[idx] == vent_y and z[idx] > 0.000001:
#       distance_from_vent = sqrt((vent_x - lon)**2 + (vent_y - y[idx])**2)
#       X.append(distance_from_vent)
#       Z.append(z[idx])
# #print min(Z)
        
# plt.plot(X,Z, color='blue', label="R = 9 km | H = 20 km | K = 750", linestyle='--', linewidth = 0.8)

################## PLOT LINE 5 #################################################

# x, y, z = np.genfromtxt(r'xyz_0phi_Vd4.txt', unpack=True)

# X = []
# Z = []
# for idx, lon in enumerate(x):
#     if lon >= vent_x and y[idx] == vent_y and z[idx] > 0.000001:
#       distance_from_vent = sqrt((vent_x - lon)**2 + (vent_y - y[idx])**2)
#       X.append(distance_from_vent)
#       Z.append(z[idx])
# #print min(Z)
        
# plt.plot(X,Z, color='black', linestyle='--', label="R = 5 km | H = 30 km | K = 9500", linewidth = 0.8)

################## PLOT LINE 6 #################################################

# x, y, z = np.genfromtxt(r'xyz_Tt_Vd5.txt', unpack=True)

# X = []
# Z = []
# for idx, lon in enumerate(x):
#     if lon >= vent_x and y[idx] == vent_y and z[idx] > 0.000001:
#       distance_from_vent = sqrt((vent_x - lon)**2 + (vent_y - y[idx])**2)
#       X.append(distance_from_vent)
#       Z.append(z[idx])
# #print min(Z)
        
# plt.plot(X,Z, color='green', linestyle='--', label="R = 15 km | H = 30 km | K = 22500", linewidth = 0.9)

################################################################################

#plt.axvline(x = 15000,  color='black', linestyle='--', linewidth = 0.4, label = "Radius")
plt.axis([0,255000, 0, 65], aspect="auto")
#plt.annotate('Mass = 3.74E+09 kg\nK = 15000\nHeight = 10 km\nRadius = 15 km', 
#              xy=(45000, 0.2))
#plt.annotate('GRID', xy=(10000, .4))
plt.xlabel('Distance $(m)$')
plt.ylabel('Thickness $(cm)$')
#plt.yticks(np.arange(0, 11, 1))
plt.legend()
plt.title('New simulations')
plt.tight_layout()
plt.show()
#plt.savefig('Figure 2.png', figsize=(8, 6), dpi=300, facecolor='w', edgecolor='k')

################################################################################
