import * as React from "react";
import { ICanvasShape, Ipoint } from "../interfaces";
import { CityType  } from "../stores/simulation-store";
import styled from "styled-components";
import { Stage, Sprite } from "@inlet/react-pixi";
import { PixiCityContainer } from "./pixi-city-container";
import { PixiTephraMap } from "./pixi-tephra-map";
import { PixiAxis } from "./pixi-axis";
import { PixiGrid } from "./pixi-grid";
import { CrossSectionSelectorComponent } from "./pixi-cross-section-selector";
import VolcanoEmitter from "./pixi-volcano-emitter";
import * as AshConfig from "../assets/particles/ash.json";

import * as Color from "color";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { getSnapshot, IStateTreeNode } from "mobx-state-tree";
import { EmitterConfig } from "pixi-particles";

const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
`;

interface IState {
  moveMouse: boolean;
}

interface IProps extends IBaseProps {
  numRows: number;
  numCols: number;
  width: number;
  height: number;
  windSpeed: number;
  windDirection: number;
  mass: number;
  colHeight: number;
  particleSize: number;
  volcanoX: number;
  volcanoY: number;
  gridColors: IStateTreeNode<any, string[]>;
  gridValues: IStateTreeNode<any, string[]>;
  cities: CityType[];
  map: string;
  isErupting: boolean;
  hasErupted: boolean;
  showCrossSectionSelector: boolean;
}

@inject("stores")
@observer
export class MapComponent extends BaseComponent<IProps, IState>{

  private ref = React.createRef<HTMLDivElement>();
  private metrics: ICanvasShape;

  constructor(props: IProps) {
    super(props);

    const initialState: IState = {
      moveMouse: true
    };

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);

    this.state = initialState;
  }

  public handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { moveMouse } = this.state;
    if (moveMouse) {
      this.stores.setMousePos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  }
  public handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const { moveMouse } = this.state;
    this.setState({moveMouse: !moveMouse});
  }

  public render() {
    const {numCols, numRows, width, height } = this.props;
    const gridSize = Math.round(width / numCols);
    this.metrics  = {
      gridSize,
      height,
      width,
      numCols,
      numRows
    };

    const {
      cities,
      volcanoX,
      volcanoY,
      gridColors,
      gridValues,
      windDirection,
      windSpeed,
      mass,
      map,
      isErupting,
      hasErupted,
      showCrossSectionSelector
    } = this.props;

    const cityItems = cities.map( (city) => {
      const {x, y, name, id} = city;
      if (x && y && name) {
        return <PixiCityContainer gridSize={gridSize} key={id} position={this.toCanvasCoords({x, y})} name={name} />;
      }
    });

    const volcanoPos = this.toCanvasCoords({x: volcanoX, y: volcanoY}, gridSize);
    const { mouseX, mouseY } = this.stores;
    const { moveMouse } = this.state;

    return (
      <CanvDiv ref={this.ref}
        onMouseMove={this.handleMouseMove}
        onMouseDown={this.handleMouseDown}>
        <Stage
          width={width}
          height={height}
          options={
            {
              backgroundColor: Color("hsl(0, 10%, 95%)").rgbNumber(),
              antialias: true
            }
          } >
          <Sprite image={map} x={0} y={0} width={width} height={height} />
          <PixiTephraMap
            canvasMetrics={this.metrics}
            gridColors={getSnapshot(gridColors)}
            gridValues={getSnapshot(gridValues)}
            toCanvasCoords={this.toCanvasCoords} />
          {cityItems}
          <PixiAxis gridMetrics={this.metrics} toCanvasCoords={this.toCanvasCoords} />
          <PixiGrid gridMetrics={this.metrics} />
          <Sprite image={"./assets/volcano.png"}
            x={volcanoPos.x - 10}
            y={volcanoPos.y - 10}
            width={60}
            height={60} />
          <VolcanoEmitter
            config={AshConfig.config as unknown as EmitterConfig}
            imagePath={AshConfig.image}
            x={volcanoPos.x + 20}
            y={volcanoPos.y + 20}
            windDirection={windDirection}
            windSpeed={windSpeed}
            mass={mass}
            playing={isErupting} />
          {showCrossSectionSelector && hasErupted &&
          <CrossSectionSelectorComponent
            volcanoX={volcanoPos.x + 20}
            volcanoY={volcanoPos.y + 20}
            mouseX={mouseX}
            mouseY={mouseY}
            isPlaced={moveMouse} /> }
        </Stage>
      </CanvDiv>
    );
  }

  public toCanvasCoords = (point: Ipoint, scale = 1): Ipoint => {
    return {x: point.x * scale, y: (this.props.numRows - point.y - 1) * scale};
  }
}
