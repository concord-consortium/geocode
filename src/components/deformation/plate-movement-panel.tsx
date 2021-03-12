import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";
import { HorizontalContainer, VerticalContainer } from "../styled-containers";
import SpeedDirectionWidget from "../widgets/wind-speed-direction-widget";
import { WidgetPanelTypes } from "../../utilities/widget";

const PlateDiv = styled.div`
  margin: 5px;
  font-size: 14px;
  font-weight: normal;
`;

const PlateContainer = styled(HorizontalContainer)`
  margin: 0 81px 0 81px;
`;

interface IProps {
  leftSpeed: number;
  leftDirection: number;
  rightSpeed: number;
  rightDirection: number;
}

interface IState {}

export class PlateMovementPanel extends PureComponent<IProps, IState> {

  public render() {
    const {leftSpeed, leftDirection, rightSpeed, rightDirection} = this.props;
    return (
        <PlateContainer alignItems="center" justifyContent="space-between">
        <VerticalContainer alignItems="center" justifyContent="center">
          <PlateDiv>Plate 1</PlateDiv>
          <SpeedDirectionWidget
            type={WidgetPanelTypes.RIGHTDEFORMATIONPLATE1}
            showWindDirection={true}
            showWindSpeed={true}
            windDirection={leftDirection}
            windSpeed={leftSpeed}
            showWindSymbolIcon={false}
            speedUnits={"mm/y"}
            maxWindSpeed={50}
            showAngleMarkers={true}
            orientArrowFromAngle={false}
          />
        </VerticalContainer>
        <VerticalContainer alignItems="center" justifyContent="center">
          <PlateDiv>Plate 2</PlateDiv>
          <SpeedDirectionWidget
            type={WidgetPanelTypes.RIGHTDEFORMATIONPLATE2}
            showWindDirection={true}
            showWindSpeed={true}
            windDirection={rightDirection}
            windSpeed={rightSpeed}
            showWindSymbolIcon={false}
            speedUnits={"mm/y"}
            maxWindSpeed={50}
            showAngleMarkers={true}
            orientArrowFromAngle={false}
          />
        </VerticalContainer>
      </PlateContainer>
    );
  }
}
