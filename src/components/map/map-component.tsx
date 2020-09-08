import * as React from "react";
import * as L from "leaflet";

import { Map as LeafletMap, TileLayer, Marker, Popup, ScaleControl, Pane } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../css/map-component.css";
import { iconVolcano, iconMarker, getCachedDivIcon, getCachedCircleIcon, riskIcon, getCachedSampleLocationIcon } from "../icons";

import { CityType  } from "../../stores/tephra-simulation-store";
import * as Scenarios from "../../assets/maps/scenarios.json";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "../base";
import { CrossSectionDrawLayer } from "./layers/cross-section-draw-layer";
import { LocalToLatLng } from "../../utilities/coordinateSpaceConversion";
import { MapTephraThicknessLayer } from "./map-tephra-thickness-layer";
import { MapTriangulatedStrainLayer } from "./map-triangulated-strain-layer";
import { OverlayControls } from "../overlay-controls";
import { RulerDrawLayer } from "./layers/ruler-draw-layer";
import { RightSectionTypes } from "../tabs";
import KeyButton from "./map-key-button";
import CompassComponent from "./map-compass";
import { LegendComponent } from "./map-legend";
import { SamplesCollectionModelType, SamplesLocationModelType } from "../../stores/samples-collections-store";
import { RiskLevels } from "../montecarlo/monte-carlo";
import { LatLngDrawLayer } from "./layers/latlng-draw-layer";
import { MapGPSStationsLayer } from "./map-gps-stations-layer";

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
  volcanoLat?: number;
  volcanoLng?: number;
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
  private latlngRef = React.createRef<LatLngDrawLayer>();
  private hoverCoords = React.createRef<L.LatLng>();

  constructor(props: IProps) {
    super(props);

    const initialState: IState = {
      moveMouse: false,
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
      volcanoLat,
      volcanoLng,
      windDirection,
      windSpeed,
      colHeight,
      mass,
      hasErupted,
      scenario: tephraScenario,
    } = this.stores.tephraSimulation;

    const {
      scenario: seismicScenario
    } = this.stores.seismicSimulation;

    const scenario = isTephraUnit ? tephraScenario : seismicScenario;

    const { showCrossSection } = this.stores.uiStore;

    const scenarioData = (Scenarios as {[key: string]: Scenario})[scenario];

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
      isSelectingLatlng,
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
    const riskItems = this.getRiskItems();

    const center: L.LatLngTuple = isTephraUnit ? [volcanoLat, volcanoLng] :
      [(bottomRightLat + topLeftLat) / 2, (bottomRightLng + topLeftLng) / 2];

    const { crossPoint1Lat, crossPoint1Lng, crossPoint2Lat, crossPoint2Lng,
            latLngPoint1Lat, latLngPoint1Lng, latLngPoint2Lat, latLngPoint2Lng } =
      this.stores.tephraSimulation;
    const volcanoPos = L.latLng(volcanoLat, volcanoLng);
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
          onclick={this.onMapClick}
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
                  position={[volcanoLat, volcanoLng]}
                  icon={iconVolcano}>
                  <Popup>
                    Popup for any custom information.
                  </Popup>
                </Marker>
                {cityItems}
                {pinItems}
                {riskItems}
                {sampleLocations}
                {isSelectingLatlng && <LatLngDrawLayer
                  ref={this.latlngRef}
                  map={this.state.mapLeafletRef}
                  p1Lat={latLngPoint1Lat}
                  p2Lat={latLngPoint2Lat}
                  p1Lng={latLngPoint1Lng}
                  p2Lng={latLngPoint2Lng}
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
              // <Pane key="strain-layer"
              //   style={{zIndex: 2}}>
              //   <MapTriangulatedStrainLayer
              //     map={this.state.mapLeafletRef}
              //     minLat={35}
              //     maxLat={37}
              //     minLng={-124}
              //     maxLng={-119}
              //   />
              // </Pane>,
              <MapGPSStationsLayer
                key="gps-layer"
                map={this.state.mapLeafletRef}
                mapScale={this.state.mapLeafletRef.getZoom()}
              />,
              (isSelectingLatlng && <LatLngDrawLayer
                ref={this.latlngRef}
                map={this.state.mapLeafletRef}
                p1Lat={latLngPoint1Lat}
                p2Lat={latLngPoint2Lat}
                p1Lng={latLngPoint1Lng}
                p2Lng={latLngPoint2Lng}
              />)
            ]
          }
        </LeafletMap>
        <OverlayControls
          showRuler={isSelectingRuler}
          onRulerClick={this.stores.tephraSimulation.rulerClick}
          onLatLngClick={this.stores.tephraSimulation.latlngClick}
          isSelectingCrossSection={isSelectingCrossSection}
          isSelectingLatLng={isSelectingLatlng}
          showCrossSection={hasErupted && showCrossSection && panelType === RightSectionTypes.CROSS_SECTION}
          onCrossSectionClick={this.stores.tephraSimulation.crossSectionClick}
          onReCenterClick={this.onRecenterClick}
        />
        { this.state.showKey
          ? <KeyButton onClick={this.onKeyClick}/>
          : <LegendComponent
              onClick={this.onKeyButtonClick}
              showTephra={panelType !== RightSectionTypes.MONTE_CARLO}
            />
        }
        <CompassComponent/>
      </CanvDiv>
    );
  }

  private onKeyClick = () => {
    this.setState({showKey: false});
  }
  private onKeyButtonClick = () => {
    this.setState({showKey: true});
  }

  private onRecenterClick = () => {
    if (this.map.current) {
      const { volcanoLat, volcanoLng, scenario } = this.stores.tephraSimulation;
      const scenarioData = (Scenarios as {[key: string]: Scenario})[scenario];
      const { initialZoom } = scenarioData;

      this.map.current.leafletElement.flyTo(L.latLng(volcanoLat, volcanoLng), initialZoom);
    }
  }
  private onMapClick = (e: any) => {
    const { tephraSimulation } = this.stores;
    if (tephraSimulation.isSelectingLatlng) {
      tephraSimulation.setPoint1Pos(e.latlng.lat, e.latlng.lng);
    } else return;
  }

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
  }

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
  }

  private getRiskItems = () => {
    const { samplesCollectionsStore } = this.stores;
    const { volcanoLat, volcanoLng } = this.stores.tephraSimulation;
    const riskItems: React.ReactElement[] = [];
    const tabIndex = this.stores.uiStore.currentHistogramTab;
    const histogramCharts = this.stores.chartsStore.charts.filter(chart => chart.type === "histogram");
    const currentChart = histogramCharts && histogramCharts[tabIndex];
    const chartName = currentChart && currentChart.title ? currentChart.title : undefined;
    samplesCollectionsStore.samplesCollections.forEach( (samplesCollection: SamplesCollectionModelType, i) => {
      const riskLevel = RiskLevels.find((risk) => risk.type === samplesCollection.risk);
      const pos = LocalToLatLng({x: samplesCollection.x, y: samplesCollection.y}, L.latLng(volcanoLat, volcanoLng));
      riskLevel && riskItems.push(
        <Marker
          position={[pos.lat, pos.lng]}
          icon={riskIcon(riskLevel.iconColor, riskLevel.iconText, chartName === samplesCollection.name)}
          key={"risk-" + i}
        />
      );
    });
    return riskItems;
  }
}
