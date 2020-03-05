import * as React from "react";
import * as L from "leaflet";

import { Map as LeafletMap, TileLayer, Marker, Popup, ScaleControl, Pane } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../css/map-component.css";
import { iconVolcano, iconMarker, getCachedDivIcon, riskIcon } from "../icons";

import { CityType  } from "../../stores/simulation-store";
import * as Scenarios from "../../assets/maps/scenarios.json";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "../base";
import { CrossSectionDrawLayer } from "./layers/cross-section-draw-layer";
import { LocalToLatLng } from "../../utilities/coordinateSpaceConversion";
import { MapTephraThicknessLayer } from "./map-tephra-thickness-layer";
import { OverlayControls } from "../overlay-controls";
import { RulerDrawLayer } from "./layers/ruler-draw-layer";
import { RightSectionTypes } from "../tabs";
import KeyButton from "./map-key-button";
import CompassComponent from "./map-compass";
import TephraLegendComponent from "./map-tephra-legend";
import RiskLegendComponent from "./map-risk-legend";
import { SamplesCollectionModelType } from "../../stores/samples-collections-store";
import { kTephraThreshold, ThresholdData, calculateThresholdData, calculateRisk } from "../montecarlo/monte-carlo";

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
  volcanoLat: number;
  volcanoLng: number;
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
    this.stores.simulation.setPoint1Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    this.stores.simulation.setPoint2Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    this.setState({moveMouse: true});
  }

  public handleDragMove(e: React.MouseEvent<HTMLDivElement>) {
    const { moveMouse } = this.state;
    if (moveMouse) {
      this.stores.simulation.setPoint2Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  }

  public handleDragExit(e: React.MouseEvent<HTMLDivElement>) {
    this.stores.simulation.setPoint2Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
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
    }
    if (this.map.current) {
      this.setState({mapLeafletRef: this.map.current.leafletElement});
    }
  }

  public render() {
    const { width, height, panelType } = this.props;

    const {
      cities,
      volcanoLat,
      volcanoLng,
      windDirection,
      windSpeed,
      colHeight,
      mass,
      hasErupted,
      scenario,
    } = this.stores.simulation;

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
      isSelectingRuler
    } = this.stores.simulation;

    const cityItems = cities.map( (city: CityType) => {
      const {x, y, name} = city;
      if (x && y && name) {
        const mapPos = LocalToLatLng({x, y}, L.latLng(volcanoLat, volcanoLng));
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

    const riskItems = panelType === RightSectionTypes.MONTE_CARLO && this.getRiskItems();

    const { crossPoint1Lat, crossPoint1Lng, crossPoint2Lat, crossPoint2Lng } = this.stores.simulation;
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
          ondragend={this.reRenderMap}
          onzoomend={this.reRenderMap}
          center={[volcanoLat, volcanoLng]}
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
          </Pane>
          <Pane
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
            { isSelectingCrossSection && <CrossSectionDrawLayer
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
        </LeafletMap>
        <OverlayControls
          showRuler={isSelectingRuler}
          onRulerClick={this.stores.simulation.rulerClick}
          isSelectingCrossSection={isSelectingCrossSection}
          showCrossSection={hasErupted && showCrossSection && panelType === RightSectionTypes.CROSS_SECTION}
          onCrossSectionClick={this.stores.simulation.crossSectionClick}
          onReCenterClick={this.onRecenterClick}
        />
        { this.state.showKey
          ? <KeyButton onClick={this.onKeyClick}/>
          : panelType === RightSectionTypes.MONTE_CARLO
            ? <RiskLegendComponent onClick={this.onKeyButtonClick}/>
            : <TephraLegendComponent onClick={this.onKeyButtonClick}/>
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
      const { volcanoLat, volcanoLng, scenario } = this.stores.simulation;
      const scenarioData = (Scenarios as {[key: string]: Scenario})[scenario];
      const { initialZoom } = scenarioData;

      this.map.current.leafletElement.flyTo(L.latLng(volcanoLat, volcanoLng), initialZoom);
    }
  }

  private reRenderMap = () => {
    if (this.tephraRef.current) {
      // Update values in the store to trigger a rerender of this component
      // note: this does NOT trigger rerender since viewportZoom is not a dependency of the render function
      if (this.map.current) {
        const center = this.map.current.leafletElement.getCenter();
        const zoom = this.map.current.leafletElement.getZoom();
        this.stores.simulation.setViewportParameters(zoom, center.lat, center.lng);
      }
    }
  }

  private getRiskItems = () => {
    // TODO: this code adds a risk map item for every sample collection with threshold kTephraThreshold
    // need to specify correct samples to add risk item and correct threshold
    const { samplesCollectionsStore } = this.stores;
    const { volcanoLat, volcanoLng } = this.stores.simulation;
    const riskItems: React.ReactElement[] = [];
    samplesCollectionsStore.samplesCollections.forEach( (samplesCollection: SamplesCollectionModelType, i) => {
      const thresholdData: ThresholdData = calculateThresholdData(samplesCollection.samples, kTephraThreshold);
      const riskLevel = calculateRisk(thresholdData.greaterThanPercent);
      const pos = LocalToLatLng({x: samplesCollection.x, y: samplesCollection.y}, L.latLng(volcanoLat, volcanoLng));
      riskLevel && riskItems.push(
        <Marker
          position={[pos.lat, pos.lng]}
          icon={riskIcon(riskLevel.iconColor, riskLevel.iconText, true)}
          key={"risk-" + i}
        />
      );
    });
    return riskItems;
  }
}
