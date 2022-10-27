# Changelog
## Version 2.8.0 - release October 26, 2022
### Features/Improvements
- **[GeoCode][Seismic]** Change color of "Run from year..." loop block to the blue "Logic" color and move it to that category [#183340567](https://www.pivotaltracker.com/story/show/183340567)
- Set default speed of the Earthquake slider to "Fast" [#179499758](https://www.pivotaltracker.com/story/show/179499758)
- Fade previous line(s) when new line is being plotted on deformation graph [#181728014](https://www.pivotaltracker.com/story/show/181728014)
- Upgrade report-item api to version 2 [#183561672](https://www.pivotaltracker.com/story/show/183561672)
- **[GeoCode][Seismic]** Redesign GPS movement over time graph [#183340756](https://www.pivotaltracker.com/story/show/183340756)
- Color in full line of grid squares in Deformation Simulation [#181488809](https://www.pivotaltracker.com/story/show/181488809)
- **[GeoCode][Seismic]** Make "max deformation calculated based on __ friction" block two lines [#183583725](https://www.pivotaltracker.com/story/show/183583725)

### Bug Fixes
- When clicking on run button, error message is no longer displayed If code designed to produce more than 3 runs [#183544683](https://www.pivotaltracker.com/story/show/183544683)

## Version 2.7.0 - release May 2, 2022
### Features/Improvements:
- Author Switch to Show Deformation Graph [#181515776](https://www.pivotaltracker.com/story/show/181515776)
- Update project dependencies. [#181497650](https://www.pivotaltracker.com/story/show/181497650)
- Standardize block title case [#180994167](https://www.pivotaltracker.com/story/show/180994167)
- Show/Hide Graph Lines via Legend [#181576903](https://www.pivotaltracker.com/story/show/181576903)
- Graph Multiple Runs of Deformation Sim on a Single Plot [#181516924](https://www.pivotaltracker.com/story/show/181516924)
- Graph a Single Deformation Model Run [#181516185](https://www.pivotaltracker.com/story/show/181516185)
- Deformation graph update in real-time as the model runs [#181516910](https://www.pivotaltracker.com/story/show/181516910)
- Run Buttons on Deformation Sim [#181516948](https://www.pivotaltracker.com/story/show/181516948)
- Cursor change on clickable run labels in the graph legend [#181722649](https://www.pivotaltracker.com/story/show/181722649)
- Limit the number of deformation model runs that a student can create in the blocks [#181516254](https://www.pivotaltracker.com/story/show/181516254)
- Create new block "Create Deformation over Time graph" [#181658809](https://www.pivotaltracker.com/story/show/181658809)
- Create new block "Plot deformation on the graph" [#181658884](https://www.pivotaltracker.com/story/show/181658884)
- Block Inputs Button & Dialog [#181576799](https://www.pivotaltracker.com/story/show/181576799)
- Lock x and y axes in deformation over time graph [#181658720](https://www.pivotaltracker.com/story/show/181658720)
### Asset Sizes

| File | Size | % Increase from Previous Release |
|---|---|---|
| app.css | 7KB | 0% |
| app.js | 2.4MB | 0% |

## Version 2.6.0 - release February 16, 2022
### Features/Improvements:
- dependency updates, documentation, cleanup.
- [#180647562](https://www.pivotaltracker.com/story/show/180647562) - Project: Add webpack target and components for `report-item`.
- [#180239682](https://www.pivotaltracker.com/story/show/180239682) - Seismic: Compute Strain Rate block.
- [#181032483](https://www.pivotaltracker.com/story/show/181032483) - Seismic: Increase transparency on deformation build-up map
- [#180411544](https://www.pivotaltracker.com/story/show/180411544) - Seismic: Adjust wording in deformation key
- [#180411544](https://www.pivotaltracker.com/story/show/180239758) - Seismic: update deformation block
- [#180361402](https://www.pivotaltracker.com/story/show/180239758) - Seismic: Rename *Strain-* components to *Deformation-*

## Version 2.5.0 - released November 4, 2021

### Features/Improvements
- Tephra distribution model in extreme wind  [#178527281](https://www.pivotaltracker.com/story/show/178527281)
- Rename "Compute max deformation with..." block [#179608332](https://www.pivotaltracker.com/story/show/179608332)
- Rename "Count with years from..." block [#179608284](https://www.pivotaltracker.com/story/show/179608284)
- Add reload button to the GeoCoder model [#179499821](https://www.pivotaltracker.com/story/show/179499821)

### Bug Fixes
- Authored features (colored grid lines, fault tilt) are not holding authored state [#180194849](https://www.pivotaltracker.com/story/show/180194849)

## Version 2.4.0 - released September 22, 2021

- SEISMIC: Create Earthquakes in Deformation Simulation [#177623916](https://www.pivotaltracker.com/story/show/177623916)
- SEISMIC: Add an earthquake counter in earthquake version of DS [#179206763](https://www.pivotaltracker.com/story/show/179206763)
- SEISMIC: Color the horizontal lines inside the triangle in the DS [#179266275](https://www.pivotaltracker.com/story/show/179266275)
- SEISMIC: Make it possible to scale distance and time labels in deformation model [#179342765](https://www.pivotaltracker.com/story/show/179342765)
- SEISMIC: Make year counter in DS authorable [#178745470](https://www.pivotaltracker.com/story/show/178745470)
- SEISMIC: For the earthquake cycle version of this model we need to change the text for scale on the model [#179341569](https://www.pivotaltracker.com/story/show/179341569)
- SEISMIC: Create a loop block to set the year in the deformation model [#179388651](https://www.pivotaltracker.com/story/show/179388651)
- SEISMIC: Create a special "deformation" variable block [#179341331](https://www.pivotaltracker.com/story/show/179341331)
- SEISMIC: Create "Earthquake to release..." block [#179341515](https://www.pivotaltracker.com/story/show/179341515)
- SEISMIC: Create "Compute max deformation with friction" block [#179206536](https://www.pivotaltracker.com/story/show/179206536)
- SEISMIC: Create new code toolbox for Earthquake Version in Seismic version [#177623776](https://www.pivotaltracker.com/story/show/177623776)
- SEISMIC: Create a "change deformation block"  [#179341428](https://www.pivotaltracker.com/story/show/179341428)
- SEISMIC: Create link to seismic version of model [#177728765](https://www.pivotaltracker.com/story/show/177728765)
- SEISMIC: Update "Set speed/direction" block for plates in DS [#179197737](https://www.pivotaltracker.com/story/show/179197737)
- SEISMIC: Remove the ability to set negative speeds in DS speed blocks [179197904](https://www.pivotaltracker.com/story/show/179197904)
- SEISMIC: Update default value for apparent year scale [179499292](https://www.pivotaltracker.com/story/show/179499292)
- SEISMIC: Create new block "Set boundary orientation" [#178847442](https://www.pivotaltracker.com/story/show/178847442)
- SEISMIC: Allow users to set orientation of fault in DS with blocks [#178745477](https://www.pivotaltracker.com/story/show/178745477)
- SEISMIC/TEPHRA: The color of the block drawer and the blocks in that drawer are the same color [#178527327](https://www.pivotaltracker.com/story/show/178527327)
- TEPHRA: Remove obsolete blocks [176084553](https://www.pivotaltracker.com/story/show/176084553)

## Version 2.3.1 - released April 22, 2021

### Bug Fixes
- No units on y-axis on Wind speed graphs [177856985](https://www.pivotaltracker.com/story/show/177856985)

## Version 2.3.0 - released March 25, 2021

### Features/Improvements
- Update browser tab name [175747402](https://www.pivotaltracker.com/story/show/175747402)
- SEISMIC: Axes Display Equal Intervals on Position over Time Graph [176707032](https://www.pivotaltracker.com/story/show/176707032)
- SEISMIC: Add (W, N) to Lat-Long tool info boxes [176787959](https://www.pivotaltracker.com/story/show/176787959)
- Authorable Default Model Tab Display [175557888](https://www.pivotaltracker.com/story/show/175557888)
- SEISMIC: Gridlines on position/location graph [174846693](https://www.pivotaltracker.com/story/show/174846693)
- Blocks Always Visible in LARA [176593685](https://www.pivotaltracker.com/story/show/176593685)
- Display Tool buttons on Map based on Unit [177292659](https://www.pivotaltracker.com/story/show/177292659)
- SEISMIC: Lat-Long Tool UX [177204160](https://www.pivotaltracker.com/story/show/177204160)
- SEISMIC: Station Markers in Deformation Sim [177208787](https://www.pivotaltracker.com/story/show/177208787)
- SEISMIC: Update Right Panel Tab Colors [177208579](https://www.pivotaltracker.com/story/show/177208579)
- SEISMIC: Fault Line Label in Deformation Sim [177077410](https://www.pivotaltracker.com/story/show/177077410)
- SEISMIC: Rename Lat-Long Tool to Set region [177285776](https://www.pivotaltracker.com/story/show/177285776)
- SEISMIC: Update Deformation Text Positions [177325665](https://www.pivotaltracker.com/story/show/177325665)
- TEPHRA: Ruler Tool Styling [177204431](https://www.pivotaltracker.com/story/show/177204431)
- (Seismic) Delete GPS station WMAP [177275272](https://www.pivotaltracker.com/story/show/177275272)
- SEISMIC: Update GPS Station Table Styling [177289909](https://www.pivotaltracker.com/story/show/177289909)
- SEISMIC: Update Key Styling [177288598](https://www.pivotaltracker.com/story/show/177288598)
- TEPHRA: Update Key Styling [177288607](https://www.pivotaltracker.com/story/show/177288607)
- SEISMIC: Update button styling [177430008](https://www.pivotaltracker.com/story/show/177430008)
- SEISMIC: Plate Colors in Deformation Sim [177208666](https://www.pivotaltracker.com/story/show/177208666)
- SEISMIC: Set Point Tool [177256960](#177256960)
- SEISMIC: Plate Motion Widgets in Deformation Sim [174846688](https://www.pivotaltracker.com/story/show/174846688)
- SEISMIC: GPS Location vs Time Graph Styling [175037328](https://www.pivotaltracker.com/story/show/175037328)
- SEISMIC: Explore Direction Widget [176787693](https://www.pivotaltracker.com/story/show/176787693)
- SEISMIC: Make Explore Direction Widget Movable [177429998](https://www.pivotaltracker.com/story/show/177429998)
- TEPHRA: Make tephra distribution colors semi-transparent [169984469](https://www.pivotaltracker.com/story/show/169984469)

### Bug Fixes
- TEPHRA: "Counts above threshold" percentage gets cut off on screen in LARA [177021690](https://www.pivotaltracker.com/story/show/177021690)
- Seismic Map Size in Firefox [177204626](https://www.pivotaltracker.com/story/show/177204626)
- GPS station direction filter no longer works [177451388](https://www.pivotaltracker.com/story/show/177451388)
- Code blocks shake once they are displayed in portal reports [172367384](https://www.pivotaltracker.com/story/show/172367384)
- GPS time vs. position graph changes with each program run [177383703](https://www.pivotaltracker.com/story/show/177383703)

## Version 2.2.3 - released January 20, 2021

- Set Monte-Carlo chart max to be at least 10 mm

## Version 2.2.2 - released January 15, 2021

- Improve learner data saving, such that the app won't save to LARA simply when a model is
  opened, but will save when a user clicks "Run" on a pre-authored model

## Version 2.2.1 - released January 13, 2021

- Fix bug athoring new models in LARA caused my migration code

## Version 2.2.0 - released January 7, 2021

- Unforked 1.0.0 and 2.0.0 data versions by adding migrations for data backward-compatibility
- Update Monte Carlo blocks
- Remove Monte Carlo risk diamonds
- Fix mirrored tephra issue leading to incorrect Monte Carlo results

## Version 2.1.0 - released November 16, 2020

- First classroom release of Seismic

## Version 2.0.0 - released September 23, 2020

- Initial Seismic model, with hard-fork of user data

## Version 1.0.0 - released September 23, 2020

- First classroom release of Tephra

## Version 0.1.3 - released August 6, 2020

- Fix incorrect wind direction in monte carlo simulation
- Fix incorrect wind direction on radial plot when using filter block
- Fix incorrect wind direction when using "Compute and visualize tephra with random wind sample" and the "Compute and visualize tephra with random wind sample and VEI" blocks

## Version 0.1.2 - released April 7, 2020

- Fix wind direction in radial plot

## Version 0.1.1 - released April 7, 2020

- Add wind data
- Add data graphs
- Add new blocks
- Add Monte Carlo tab

### Asset Sizes

| File | Size | % Increase from Previous Release |
|---|---|---|
| index.css | x bytes | n/a |
| index.js | y bytes | n/a |

