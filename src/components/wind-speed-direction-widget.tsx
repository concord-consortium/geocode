import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "./icon";
import WindWSDBlueIcon from "../assets/widget-icons/wind-speed-and-direction-blue.svg";
import WindWSDOrangeIcon from "../assets/widget-icons/wind-speed-and-direction-orange.svg";
import WindSymbolOrangeIcon from "../assets/widget-icons/wind-symbol-orange.svg";
import WindSymbolBlueIcon from "../assets/widget-icons/wind-symbol-blue.svg";
import { HorizontalContainer, ValueContainer, ValueOutput, IconContainer } from "./styled-containers";
import { WidgetPanelTypes, kWidgetPanelInfo } from "../utilities/widget";

const ValueDivider = styled.div`
  width: 1px;
  height: 21px;
  margin: 0 5px 0 5px;
  background-color: #FFDBAC;
`;

const RelativeIconContainer = styled(IconContainer)`
  position: relative;
`;

interface RotateProps {
  rotate?: number;
}
const RotateDiv = styled.div`
  position: absolute;
  height: 10px;
  width: 10px;
  transform: ${(p: RotateProps) => `${p.rotate ? `rotate(${p.rotate}deg)` : "rotate(0deg)"}`};
`;

interface AbsoluteIconProps {
  top?: number;
}
const AbsoluteIcon = styled(Icon)`
  position: absolute;
  left: -6px;
  transform: rotate(180deg);
  top: ${(p: AbsoluteIconProps) => `${p.top ? `${p.top}px` : "0px"}`};
`;

interface AbsoluteDivProps {
  top?: number;
  height?: number;
}
const AbsoluteDiv = styled.div`
  position: absolute;
  width: 2px;
  left: 4px;
  height: ${(p: AbsoluteDivProps) => `${p.height ? `${p.height}px` : "12px"}`};
  top: ${(p: AbsoluteDivProps) => `${p.top ? `${p.top}px` : "0px"}`};
  background-color: #979797;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.35);
`;

const AbsoluteTriangle = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  left: 1px;
  top: ${(p: AbsoluteDivProps) => `${p.top ? `${p.top}px` : "0px"}`};
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
}

interface IState {}

export default class WindSpeedDirectionWidget extends PureComponent<IProps, IState> {
  public static defaultProps = {
    type: WidgetPanelTypes.LEFT,
    showWindSpeed: true,
    showWindDirection: true,
    windSpeed: 1,
    windDirection: 0,
  };

  public render() {
    const { type, showWindSpeed, showWindDirection, windSpeed, windDirection } = this.props;
    const maxWindSpeed = 30;
    const constrainedSpeed = Math.min(Math.max(windSpeed, 0), maxWindSpeed);
    const arrowPos = 6;
    const arrowTailPos = -28;
    const arrowHeadOffset = 5;
    const maxArrowLength = 10;
    const arrowHeight = 1 + constrainedSpeed / maxWindSpeed * maxArrowLength;
    return (
      <ValueContainer backgroundColor={kWidgetPanelInfo[type].backgroundColor}>
        <RelativeIconContainer>
          <Icon
            width={39}
            height={39}
            fill={"black"}
          >
            { type === WidgetPanelTypes.LEFT
              ? <WindWSDOrangeIcon/>
              : <WindWSDBlueIcon/> }
          </Icon>
          { (windSpeed > 0) && <RotateDiv rotate={windDirection}>
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
              <AbsoluteDiv top={arrowPos} height={arrowHeight} />
              <AbsoluteTriangle top={arrowHeight + arrowHeadOffset} />
            </RotateDiv>
          }
        </RelativeIconContainer>
        <ValueOutput>
          <HorizontalContainer alignItems="center" justifyContent="center">
          {showWindSpeed && <div>{windSpeed} m/s</div>}
          {(showWindSpeed && showWindDirection) && <ValueDivider/ >}
          {showWindDirection && <div>{windDirection % 360} °</div>}
          </HorizontalContainer>
        </ValueOutput>
      </ValueContainer>
    );
  }

}
