import React, { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "../icon";
import WindWSDIcon from "../../assets/widget-icons/wind-speed-and-direction.svg";
import WindSymbolOrangeIcon from "../../assets/widget-icons/wind-symbol-orange.svg";
import WindSymbolBlueIcon from "../../assets/widget-icons/wind-symbol-blue.svg";
import { HorizontalContainer, ValueContainer, ValueOutput, IconContainer } from "../styled-containers";
import { WidgetPanelTypes, kWidgetPanelInfo, round } from "../../utilities/widget";

interface ValueDividerProps {
  backgroundColor?: string;
}
const ValueDivider = styled.div`
  width: 1px;
  height: 21px;
  margin: 0 5px 0 5px;
  background-color: ${(p: ValueDividerProps) => `${p.backgroundColor || "#FFDBAC"}`};
`;

const RelativeIconContainer = styled(IconContainer)`
  position: relative;
`;

interface RotateProps {
  rotate?: number;
  top?: number;
}
const RotateDiv = styled.div`
  position: absolute;
  top: ${(p: RotateProps) => `${p.top || 25}px`};
  height: 10px;
  width: 10px;
  transform: ${(p: RotateProps) => `rotate(${p.rotate || 0}deg)`};
`;

interface AbsoluteIconProps {
  top?: number;
}
const AbsoluteIcon = styled(Icon)`
  position: absolute;
  left: -5px;
  transform: rotate(180deg);
  top: ${(p: AbsoluteIconProps) => `${p.top || 0}px`};
`;

const DegreeDiv = styled.div`
  margin: 2px;
  font-size: 9px;
  font-weight: bold;
`;

interface AbsoluteDivProps {
  top?: number;
  height?: number;
}
const AbsoluteDiv = styled.div`
  position: absolute;
  width: 2px;
  left: 4px;
  height: ${(p: AbsoluteDivProps) => `${p.height || 12}px`};
  top: ${(p: AbsoluteDivProps) => `${p.top || 0}px`};
  background-color: #979797;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.35);
`;

interface AbsoluteContentDivProps {
  top?: number;
  left?: number;
}
const AbsoluteContentDiv = styled.div`
  position: absolute;
  top: ${(p: AbsoluteContentDivProps) => `${p.top || 0}px`};
  left: ${(p: AbsoluteContentDivProps) => `${p.left || 0}px`};
  font-size: 9px;
  font-weight: bold;
`;

const AbsoluteTriangle = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  left: 1px;
  top: ${(p: AbsoluteDivProps) => `${p.top || 0}px`};
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 8px solid #979797;
`;

interface IProps {
  type: WidgetPanelTypes;
  showWindSpeed: boolean;
  showWindDirection: boolean;
  windSpeed: number;
  windDirection: number;
  showWindSymbolIcon?: boolean;
  speedUnits?: string;
  maxWindSpeed?: number;
  showAngleMarkers?: boolean;
  orientArrowFromAngle?: boolean;
  showBorder?: boolean;
}

interface IState {}

export default class SpeedDirectionWidget extends PureComponent<IProps, IState> {
  public static defaultProps = {
    type: WidgetPanelTypes.LEFT,
    showWindSpeed: true,
    showWindDirection: true,
    windSpeed: 1,
    windDirection: 0,
    showWindSymbolIcon: true,
    speedUnits: "m/s",
    maxWindSpeed: 30,
    showAngleMarkers: false,
    orientArrowFromAngle: true,
    showBorder: false
  };

  public render() {
    const { type, showWindSpeed, showWindDirection, windSpeed, windDirection, showWindSymbolIcon,
            speedUnits, maxWindSpeed, showAngleMarkers, orientArrowFromAngle, showBorder } = this.props;
    const constrainedSpeed = Math.min(windSpeed, maxWindSpeed || 30);
    const normalizedSpeed = Math.abs(constrainedSpeed);
    const arrowPos = 6;
    const arrowTailPos = -28;
    const arrowHeadOffset = 5;
    const maxArrowLength = 10;
    const arrowHeight = 1 + normalizedSpeed / (maxWindSpeed || 30) * maxArrowLength;
    const normalizedAngle = windDirection < 0 ? 360 + (windDirection % 360) : windDirection % 360;
    const speedAdjustedAngle = windSpeed < 0 ? 360 - normalizedAngle : normalizedAngle;
    const rotationAngle = !orientArrowFromAngle ? (180 + speedAdjustedAngle) % 360 : speedAdjustedAngle;
    return (
      <ValueContainer
        backgroundColor={kWidgetPanelInfo[type].backgroundColor}
        height={showAngleMarkers ? 89 : undefined}
        showBorder={showBorder}
      >
        {showAngleMarkers && <DegreeDiv>0°</DegreeDiv>}
        <RelativeIconContainer>
          <Icon
            width={39}
            height={39}
            fill={kWidgetPanelInfo[type].highlightColor}
          >
            <WindWSDIcon/>
          </Icon>
          {normalizedSpeed > 0 &&
            <RotateDiv rotate={rotationAngle} top={showAngleMarkers ? 14 : 25}>
              {showWindSymbolIcon &&
                <AbsoluteIcon
                  width={22}
                  height={17}
                  fill={"black"}
                  top={arrowTailPos}
                >
                  { type === WidgetPanelTypes.LEFT
                    ? <WindSymbolOrangeIcon/>
                    : <WindSymbolBlueIcon/> }
                </AbsoluteIcon>
              }
              <AbsoluteDiv top={arrowPos} height={arrowHeight} />
              <AbsoluteTriangle top={arrowHeight + arrowHeadOffset} />
            </RotateDiv>
          }
          {showAngleMarkers &&
            <React.Fragment>
              <AbsoluteContentDiv top={14} left={44}>90°</AbsoluteContentDiv>
              <AbsoluteContentDiv top={14} left={-24}>270°</AbsoluteContentDiv>
            </React.Fragment>
          }
          {showAngleMarkers && <DegreeDiv>180°</DegreeDiv>}
        </RelativeIconContainer>
        <ValueOutput data-test="info">
          <HorizontalContainer alignItems="center" justifyContent="center">
          {showWindSpeed && <div>{`${round(windSpeed, 1)} ${speedUnits}`}</div>}
          {(showWindSpeed && showWindDirection)
            && <ValueDivider backgroundColor={kWidgetPanelInfo[type].backgroundColor} />}
          {showWindDirection && <div>{round(windDirection % 360, 1)} °</div>}
          </HorizontalContainer>
        </ValueOutput>
      </ValueContainer>
    );
  }

}
