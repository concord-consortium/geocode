import * as React from "react";
import { ICanvasShape } from "../interfaces";
import { SimDatumType, CityType  } from "../stores/simulation-store";
import styled from "styled-components";
import { Stage, Text } from "@inlet/react-pixi";
import { PixiTephraCrossSection } from "./pixi-tephra-cross-section";
import * as Color from "color";
import { inject, observer } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { StyledButton } from "./styled-button";

const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
`;

const ContainerDiv = styled.div`
  width: flex;
  height: flex;
`;

interface IState {
  isSelecting: boolean;
}
interface IProps extends IBaseProps {
  numRows: number;
  numCols: number;
  height: number;
  width: number;
  volcanoLat: number;
  volcanoLng: number;
  crossPoint1Lat: number;
  crossPoint1Lng: number;
  crossPoint2Lat: number;
  crossPoint2Lng: number;
  hasErupted: boolean;
  windSpeed: number;
  windDirection: number;
  colHeight: number;
  mass: number;
  particleSize: number;
  data: SimDatumType[];
  // cities: CityType[];
}

@inject("stores")
@observer
export class CrossSectionComponent extends BaseComponent<IProps, IState>{

  private ref = React.createRef<HTMLDivElement>();
  private metrics: ICanvasShape;

  public constructor(props: IProps) {
    super(props);

    const initialState: IState = {
      isSelecting: false
    };

    this.selectButton = this.selectButton.bind(this);
    this.cancel = this.cancel.bind(this);

    this.state = initialState;
  }

  public componentDidMount() {
    this.recomputeMetrics();
  }

  public componentDidUpdate(prevProps: IProps) {
    this.recomputeMetrics();
  }

  public render() {
    if (! this.metrics) { this.recomputeMetrics(); }
    const { isSelecting } = this.state;
    const {
      volcanoLat,
      volcanoLng,
      crossPoint1Lat,
      crossPoint1Lng,
      crossPoint2Lat,
      crossPoint2Lng,
      data,
      height,
      hasErupted,
      windSpeed,
      windDirection,
      colHeight,
      mass,
      particleSize
    } = this.props;
    const { width } = this.metrics;

    return (
      <CanvDiv ref={this.ref}>
        {hasErupted && <ContainerDiv>
          {!isSelecting && <StyledButton onClick={this.selectButton}>Draw a cross section line</StyledButton> }
          {isSelecting &&
          <ContainerDiv>
            <StyledButton onClick={this.cancel}>Cancel</StyledButton>
            <Stage
              width={width}
              height={height}
              options={{backgroundColor: Color("hsl(0, 10%, 95%)").rgbNumber()}} >
              <PixiTephraCrossSection
                canvasMetrics={this.metrics}
                data={data.map( (d) => d.thickness )}
                volcanoLat={volcanoLat}
                volcanoLng={volcanoLng}
                crossPoint1Lat={crossPoint1Lat}
                crossPoint1Lng={crossPoint1Lng}
                crossPoint2Lat={crossPoint2Lat}
                crossPoint2Lng={crossPoint2Lng}
                windSpeed={windSpeed}
                windDirection={windDirection}
                colHeight={colHeight}
                mass={mass}
                particleSize={particleSize} />
            </Stage>
          </ContainerDiv>}
        </ContainerDiv>}
      </CanvDiv>
    );
  }

  private selectButton() {
    this.setState({isSelecting: true});
    this.stores.setCrossSectionSelectorVisibility(true);
  }

  private cancel() {
    this.setState({isSelecting: false});
    this.stores.setCrossSectionSelectorVisibility(false);
  }

  private recomputeMetrics() {
    const {numCols, numRows, width, height } = this.props;
    const gridSize = width / numCols;
    this.metrics  = {
      gridSize,
      height,
      width,
      numCols,
      numRows
    };
  }
}
