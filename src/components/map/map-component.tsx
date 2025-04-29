import React from "react";
import L from "leaflet";

import { Map as LeafletMap, TileLayer, Marker, Popup, ScaleControl, Pane } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../css/map-component.css";
import { iconVolcano, iconMarker, getCachedDivIcon, getCachedSampleLocationIcon } from "../icons";

import { CityType  } from "../../stores/tephra-simulation-store";
import Scenarios from "../../assets/maps/scenarios.json";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "../base";
import { CrossSectionDrawLayer } from "./layers/cross-section-draw-layer";
import { LocalToLatLng } from "../../utilities/coordinateSpaceConversion";
import { MapTephraThicknessLayer } from "./map-tephra-thickness-layer";
import { MapTriangulatedDeformationLayer } from "./map-triangulated-deformation-layer";
import { OverlayControls } from "../overlay-controls";
import { RulerDrawLayer } from "./layers/ruler-draw-layer";
import { RightSectionTypes } from "../tabs";
import KeyButton from "./map-key-button";
import CompassComponent from "./map-compass";
import { LegendComponent, LegendType } from "./map-legend";
import { SamplesLocationModelType } from "../../stores/samples-collections-store";
import { LatLngRegionDrawLayer } from "./layers/latlng-region-draw-layer";
import { LatLngPointDrawLayer } from "./layers/latlng-point-draw-layer";
import { MapGPSStationsLayer } from "./map-gps-stations-layer";
import { ColorMethod } from "../../stores/seismic-simulation-store";
import { MapDirectionTool } from "./map-direction-tool";

interface WorkspaceProps {
  width: number;
  height: number;
}
export interface Scenario {
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
  topLeftLat: number;
  topLeftLng: number;
  bottomRightLat: number;
  bottomRightLng: number;
  centerLat: number;
  centerLng: number;
  extraMarkers?: any[];
}

const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
  width: ${(p: WorkspaceProps) => `${p.width - 56}px`};
  height: ${(p: WorkspaceProps) => `${p.height}px`};
  padding-left: 28px;
  padding-right: 28px;
  padding-top: 25px;
  box-sizing: content-box;
`;

interface IState {
  moveMouse: boolean;
  showDirection: boolean;
  showRuler: boolean;
  showKey: boolean;
  mapLeafletRef: any;
}

interface IProps extends IBaseProps {
  width: number;
  height: number;
  panelType: RightSectionTypes;
}

@inject("stores")
@observer
export class MapComponent extends BaseComponent<IProps, IState>{

  private ref = React.createRef<HTMLDivElement>();
  private map = React.createRef<LeafletMap>();
  private crossRef = React.createRef<CrossSectionDrawLayer>();
  private tephraRef = React.createRef<MapTephraThicknessLayer>();
  private latlngPointRef = React.createRef<LatLngPointDrawLayer>();
  private latlngRegionRef = React.createRef<LatLngRegionDrawLayer>();
  private hoverCoords = React.createRef<L.LatLng>();

  constructor(props: IProps) {
    super(props);

    const initialState: IState = {
      moveMouse: false,
      showDirection: false,
      showRuler: false,
      showKey: true,
      mapLeafletRef: null,
    };
    this.handleDragMove = this.handleDragMove.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragExit = this.handleDragExit.bind(this);
    this.state = initialState;
  }

  public handleDragEnter(e: React.MouseEvent<HTMLDivElement>) {
    this.stores.tephraSimulation.setPoint1Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    this.stores.tephraSimulation.setPoint2Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    this.setState({moveMouse: true});
  }

  public handleDragMove(e: React.MouseEvent<HTMLDivElement>) {
    const { moveMouse } = this.state;
    if (moveMouse) {
      this.stores.tephraSimulation.setPoint2Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  }

  public handleDragExit(e: React.MouseEvent<HTMLDivElement>) {
    this.stores.tephraSimulation.setPoint2Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    this.setState({moveMouse: false});
  }

  public componentDidMount() {
    // zoomend and moveend are needed because viewportZoom is not a dependency
    // of the render function and setting it in reRenderMap will not cause re-render
    if (this.map.current) {
      this.map.current.leafletElement.on("zoomend", function() {
        this.forceUpdate();
      }.bind(this));

      this.map.current.leafletElement.on("moveend", function() {
        this.forceUpdate();
      }.bind(this));

      this.map.current.leafletElement.on("mousemove", function(e: any) {
        this.hoverCoords.current = e.latlng;
      }.bind(this));
    }
    if (this.map.current) {
      this.setState({mapLeafletRef: this.map.current.leafletElement});
    }
  }

  public render() {
    const { width, height, panelType } = this.props;

    const { name: unitName } = this.stores.unit;

    const isTephraUnit = unitName === "Tephra";

    const {
      cities,
      volcanoLat: centerLat,
      volcanoLng: centerLng,
      windDirection,
      windSpeed,
      colHeight,
      mass,
      hasErupted,
      scenario: tephraScenario,
    } = this.stores.tephraSimulation;

    const {
      scenario: seismicScenario,
      deformationMapColorMethod,
    } = this.stores.seismicSimulation;

    const scenario = isTephraUnit ? tephraScenario : seismicScenario;

    const { showCrossSection } = this.stores.uiStore;

    const scenarioData = (Scenarios as {[key: string]: Scenario})[scenario];

    const legendType: LegendType = isTephraUnit ?
                        (panelType !== RightSectionTypes.MONTE_CARLO ? "Tephra" : "Risk") :
                        "Deformation";

    const {
      initialZoom,
      minZoom,
      maxZoom,
      topLeftLat,
      topLeftLng,
      bottomRightLat,
      bottomRightLng,
      extraMarkers,
    } = scenarioData;

    const {
      isSelectingCrossSection,
      isSelectingRuler,
      isSelectingSetPoint,
      isSelectingSetRegion,
    } = this.stores.tephraSimulation;

    const cityItems = cities.map( (city: CityType) => {
      const {x, y, name} = city;
      if (x && y && name) {
        const cityIcon = getCachedDivIcon(name);
        return (
          <Marker
          position={[x, y]}
          icon={cityIcon}
          key={name}>
            <Popup>
              {name}
            </Popup>
          </Marker>
        );
      }
    });
    const pinItems = extraMarkers
      ? extraMarkers.map( (city: CityType) => {
        const {x, y, name} = city;
        if (x && y && name) {
          return (
            <Marker
            position={[x, y]}
            icon={iconMarker}
            key={name}>
              <Popup>
                {name}
              </Popup>
            </Marker>
          );
        }
      })
    : null;

    const sampleLocations = this.getSampleLocations();
    // const riskItems = this.getRiskItems();

    const center: L.LatLngTuple = [centerLat, centerLng];

    const { crossPoint1Lat, crossPoint1Lng, crossPoint2Lat, crossPoint2Lng, latLngPointLat, latLngPointLng,
            latLngRegionPoint1Lat, latLngRegionPoint1Lng, latLngRegionPoint2Lat, latLngRegionPoint2Lng } =
      this.stores.tephraSimulation;
    const volcanoPos = L.latLng(centerLat, centerLng);
    const corner1 = L.latLng(topLeftLat, topLeftLng);
    const corner2 = L.latLng(bottomRightLat, bottomRightLng);
    const bounds = L.latLngBounds(corner1, corner2);
    let viewportBounds = bounds;
    if (this.map.current) {
      viewportBounds = this.map.current.leafletElement.getBounds();
    }
    return (
      <CanvDiv
        ref={this.ref}
        width={width}
        height={height}
      >
        <LeafletMap
          className="map"
          ref={this.map}
          onclick={this.onMapSelect}
          ondragend={this.reRenderMap}
          onzoomend={this.reRenderMap}
          center={center}
          zoom={initialZoom}
          maxBounds={bounds}
          maxBoundsViscosity={1}
          minZoom={minZoom}
          maxZoom={maxZoom}
          attributionControl={true}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={!(isSelectingRuler || isSelectingCrossSection)}
          animate={true}
          easeLinearity={0.35}
          >
          <ScaleControl
            position="topleft"
          />
          <Pane
            style={{zIndex: 0}}>
            <TileLayer
                url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            />
          </Pane>
          {
            isTephraUnit &&
            [
              <Pane key="tephra-layer"
                style={{zIndex: 2}}>
                <MapTephraThicknessLayer
                  ref={this.tephraRef}
                  corner1Bound={corner1}
                  corner2Bound={corner2}
                  viewportBounds={viewportBounds}
                  volcanoPos={volcanoPos}
                  gridSize={1}
                  map={this.state.mapLeafletRef}
                  windSpeed={windSpeed}
                  windDirection={windDirection}
                  colHeight={colHeight}
                  mass={mass}
                  hasErupted={hasErupted}
                />
              </Pane>,
              <Pane key="tephra-marker-layer"
                style={{zIndex: 3}}>
                <Marker
                  position={[centerLat, centerLng]}
                  icon={iconVolcano}>
                  <Popup>
                    Popup for any custom information.
                  </Popup>
                </Marker>
                {cityItems}
                {pinItems}
                {/* {riskItems} */}
                {sampleLocations}
                {isSelectingSetPoint && <LatLngPointDrawLayer
                  key="lat-lng-point-layer"
                  ref={this.latlngPointRef}
                  map={this.state.mapLeafletRef}
                  pLat={latLngPointLat}
                  pLng={latLngPointLng}
                /> }
                {isSelectingSetRegion && <LatLngRegionDrawLayer
                  key="lat-lng-region-layer"
                  ref={this.latlngRegionRef}
                  map={this.state.mapLeafletRef}
                  p1Lat={latLngRegionPoint1Lat}
                  p2Lat={latLngRegionPoint2Lat}
                  p1Lng={latLngRegionPoint1Lng}
                  p2Lng={latLngRegionPoint2Lng}
                /> }
                {isSelectingCrossSection && <CrossSectionDrawLayer
                  ref={this.crossRef}
                  map={this.state.mapLeafletRef}
                  p1Lat={crossPoint1Lat}
                  p2Lat={crossPoint2Lat}
                  p1Lng={crossPoint1Lng}
                  p2Lng={crossPoint2Lng}
                /> }
                {isSelectingRuler && <RulerDrawLayer
                  map={this.state.mapLeafletRef}
                />}
              </Pane>
            ]
          }
          {
            !isTephraUnit &&
            [
              <MapTriangulatedDeformationLayer
                key="deformation-layer"
                map={this.state.mapLeafletRef}
              />,
              <MapGPSStationsLayer
                key="gps-layer"
                map={this.state.mapLeafletRef}
                mapScale={this.getMapScale()}
                getPointFromLatLng={this.getScreenPointFromLatLng}
              />,
              (isSelectingSetPoint && <LatLngPointDrawLayer
                key="lat-lng-point-layer"
                ref={this.latlngPointRef}
                map={this.state.mapLeafletRef}
                pLat={latLngPointLat}
                pLng={latLngPointLng}
              />),
              (isSelectingSetRegion && <LatLngRegionDrawLayer
                key="lat-lng-region-layer"
                ref={this.latlngRegionRef}
                map={this.state.mapLeafletRef}
                p1Lat={latLngRegionPoint1Lat}
                p2Lat={latLngRegionPoint2Lat}
                p1Lng={latLngRegionPoint1Lng}
                p2Lng={latLngRegionPoint2Lng}
              />)
            ]
          }
        </LeafletMap>
        <OverlayControls
          showRuler={isSelectingRuler}
          onRulerClick={this.stores.tephraSimulation.rulerClick}
          onSetPointClick={this.stores.tephraSimulation.setPointClick}
          onSetRegionClick={this.stores.tephraSimulation.setRegionClick}
          isSelectingCrossSection={isSelectingCrossSection}
          isSelectingSetPoint={isSelectingSetPoint}
          isSelectingSetRegion={isSelectingSetRegion}
          isSelectingDirection={this.state.showDirection}
          showCrossSection={hasErupted && showCrossSection && panelType === RightSectionTypes.CROSS_SECTION}
          onCrossSectionClick={this.stores.tephraSimulation.crossSectionClick}
          onReCenterClick={this.handleRecenterSelect}
          onDirectionClick={this.handleDirectionButtonSelect}
        />
        { this.state.showKey
          ? <KeyButton onClick={this.handleKeySelect}/>
          : <LegendComponent
              onClick={this.handleKeyButtonSelect}
              legendType={legendType}
              colorMethod={deformationMapColorMethod as ColorMethod}
            />
        }
        { this.state.showDirection &&
          <MapDirectionTool
            onClose={this.handleDirectionToolClose}
          />
        }
        <CompassComponent/>
      </CanvDiv>
    );
  }

  private handleDirectionButtonSelect = () => {
    this.setState(prevState => ({
      showDirection: !prevState.showDirection
    }));
  };
  private handleDirectionToolClose = () => {
    this.setState({showDirection: false});
  };

  private handleKeySelect = () => {
    this.setState({showKey: false});
  };

  private handleKeyButtonSelect = () => {
    this.setState({showKey: true});
  };

  private handleRecenterSelect = () => {
    if (this.map.current) {
      const { name: unitName } = this.stores.unit;

      const isTephraUnit = unitName === "Tephra";

      const {
        scenario: tephraScenario,
      } = this.stores.tephraSimulation;

      const {
        scenario: seismicScenario
      } = this.stores.seismicSimulation;

      const scenario = isTephraUnit ? tephraScenario : seismicScenario;

      const scenarioData = (Scenarios as {[key: string]: Scenario})[scenario];

      const { initialZoom, centerLat, centerLng } = scenarioData;

      this.map.current.leafletElement.flyTo(L.latLng(centerLat, centerLng), initialZoom);
    }
  };
  private onMapSelect = (e: any) => {
    const { tephraSimulation } = this.stores;
    if (tephraSimulation.isSelectingSetRegion) {
      tephraSimulation.setPoint1Pos(e.latlng.lat, e.latlng.lng);
    }
  };

  private reRenderMap = () => {
    if (this.tephraRef.current) {
      // Update values in the store to trigger a rerender of this component
      // note: this does NOT trigger rerender since viewportZoom is not a dependency of the render function
      if (this.map.current) {
        const center = this.map.current.leafletElement.getCenter();
        const zoom = this.map.current.leafletElement.getZoom();
        this.stores.tephraSimulation.setViewportParameters(zoom, center.lat, center.lng);
      }
    }
  };

  private getSampleLocations = () => {
    const { samplesCollectionsStore } = this.stores;
    const { volcanoLat, volcanoLng } = this.stores.tephraSimulation;
    const locations: React.ReactElement[] = [];
    samplesCollectionsStore.samplesLocations.forEach( (samplesLocation: SamplesLocationModelType, i) => {
      const pos = LocalToLatLng({x: samplesLocation.x, y: samplesLocation.y}, L.latLng(volcanoLat, volcanoLng));
      locations.push(
        <Marker
          position={[pos.lat, pos.lng]}
          icon={getCachedSampleLocationIcon(samplesLocation.name)}
          key={"location-" + i}
        />
      );
    });
    return locations;
  };

  // for now we are eliminating risk diamonds on the map. They will probably return later.

  // private getRiskItems = () => {
  //   const { samplesCollectionsStore } = this.stores;
  //   const { volcanoLat, volcanoLng } = this.stores.tephraSimulation;
  //   const riskItems: React.ReactElement[] = [];
  //   const tabIndex = this.stores.uiStore.currentHistogramTab;
  //   const histogramCharts = this.stores.chartsStore.charts.filter(chart => chart.type === "histogram");
  //   const currentChart = histogramCharts && histogramCharts[tabIndex];
  //   const chartName = currentChart && currentChart.title ? currentChart.title : undefined;
  //   samplesCollectionsStore.samplesCollections.forEach( (samplesCollection: SamplesCollectionModelType, i) => {
  //     const riskLevel = RiskLevels.find((risk) => risk.type === samplesCollection.risk);
  //     const pos = LocalToLatLng({x: samplesCollection.x, y: samplesCollection.y}, L.latLng(volcanoLat, volcanoLng));
  //     riskLevel && riskItems.push(
  //       <Marker
  //         position={[pos.lat, pos.lng]}
  //         icon={riskIcon(riskLevel.iconColor, riskLevel.iconText, chartName === samplesCollection.name)}
  //         key={"risk-" + i}
  //       />
  //     );
  //   });
  //   return riskItems;
  // }

  private getMapScale = () => {
    if (this.map.current) {
      const map = this.map.current.leafletElement;
      // Get the y,x dimensions of the map
      const y = map.getSize().y;
      const x = map.getSize().x;
      // calculate the distance from one side of the map to the other using the haversine formula
      const maxMeters = map.containerPointToLatLng([0, y]).distanceTo(map.containerPointToLatLng([x, y]));
      // calculate how many meters each pixel represents
      const meterPerPixel = maxMeters / x;
      return meterPerPixel;
    } else {
      return 100;
    }
  };

  private getScreenPointFromLatLng = (latLng: L.LatLngExpression) => {
    if (this.map.current) {
      const map = this.map.current.leafletElement;
      return map.latLngToLayerPoint(latLng);
    }
  };
}
