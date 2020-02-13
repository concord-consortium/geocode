import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "./icon";
import VEI1Orange from "../assets/widget-icons/vei-1-orange.svg";
import VEI2Orange from "../assets/widget-icons/vei-2-orange.svg";
import VEI3Orange from "../assets/widget-icons/vei-3-orange.svg";
import VEI4Orange from "../assets/widget-icons/vei-4-orange.svg";
import VEI5Orange from "../assets/widget-icons/vei-5-orange.svg";
import VEI6Orange from "../assets/widget-icons/vei-6-orange.svg";
import VEI7Orange from "../assets/widget-icons/vei-7-orange.svg";
import VEI8Orange from "../assets/widget-icons/vei-8-orange.svg";
import VEI1Blue from "../assets/widget-icons/vei-1-blue.svg";
import VEI2Blue from "../assets/widget-icons/vei-2-blue.svg";
import VEI3Blue from "../assets/widget-icons/vei-3-blue.svg";
import VEI4Blue from "../assets/widget-icons/vei-4-blue.svg";
import VEI5Blue from "../assets/widget-icons/vei-5-blue.svg";
import VEI6Blue from "../assets/widget-icons/vei-6-blue.svg";
import VEI7Blue from "../assets/widget-icons/vei-7-blue.svg";
import VEI8Blue from "../assets/widget-icons/vei-8-blue.svg";
import { HorizontalContainer, VerticalContainer,
         ValueContainer, ValueOutput, IconContainer } from "./styled-containers";
import { kVEIIndexInfo } from "../utilities/vei";
import { WidgetPanelTypes, kWidgetPanelInfo } from "../utilities/widget";

interface VEIlabelProps {
  color?: string;
}
const VEIlabel = styled.div`
  font-size: 10px;
  color: ${(p: VEIlabelProps) => `${p.color ? `${p.color}` : "#ff9300"}`};
`;
const VEIvalue = styled.div`
  font-size: 11px;
`;

interface IProps {
  type: WidgetPanelTypes;
  mass: number;
  vei: number;
  columnHeight: number;
}

interface IState {}

export default class VEIWidget extends PureComponent<IProps, IState> {
  public static defaultProps = {
    type: WidgetPanelTypes.LEFT,
    vei: 1,
    mass: 1,
    columnHeight: 1,
  };

  public render() {
    const { vei, mass, columnHeight, type } = this.props;
    return (
      <ValueContainer width={160} backgroundColor={kWidgetPanelInfo[type].backgroundColor}>
        <HorizontalContainer>
          <IconContainer>
            <Icon
              width={66}
              height={55}
              fill={"black"}
            >
              {this.getVEIIcon(vei, type)}
            </Icon>
          </IconContainer>
          <VerticalContainer alignItems="center" justifyContent="center">
            <VEIlabel color={kWidgetPanelInfo[type].highlightTextColor}>Column Height</VEIlabel>
            <VEIvalue>{columnHeight / 1000} km</VEIvalue>
            <VEIlabel color={kWidgetPanelInfo[type].highlightTextColor}>Ejected Volume</VEIlabel>
            <VEIvalue data-test="info"
              dangerouslySetInnerHTML={
                {__html: `10<sup>${Math.round(Math.log(mass) / Math.LN10) - 12}</sup> km<sup>3</sup>`}
              } />
          </VerticalContainer>
        </HorizontalContainer>
        <ValueOutput>
          {`${vei}: ${this.getVEIDescription(vei)}`}
        </ValueOutput>
      </ValueContainer>
    );
  }

  private getVEIIcon = (vei: number, type: WidgetPanelTypes) => {
    const constrainedVei = Math.min(Math.max(vei, 1), 8);
    switch (constrainedVei) {
      case 1: return type === WidgetPanelTypes.LEFT ? <VEI1Orange/> : <VEI1Blue/>;
      case 2: return type === WidgetPanelTypes.LEFT ? <VEI2Orange/> : <VEI2Blue/>;
      case 3: return type === WidgetPanelTypes.LEFT ? <VEI3Orange/> : <VEI3Blue/>;
      case 4: return type === WidgetPanelTypes.LEFT ? <VEI4Orange/> : <VEI4Blue/>;
      case 5: return type === WidgetPanelTypes.LEFT ? <VEI5Orange/> : <VEI5Blue/>;
      case 6: return type === WidgetPanelTypes.LEFT ? <VEI6Orange/> : <VEI6Blue/>;
      case 7: return type === WidgetPanelTypes.LEFT ? <VEI7Orange/> : <VEI7Blue/>;
      case 8: return type === WidgetPanelTypes.LEFT ? <VEI8Orange/> : <VEI8Blue/>;
      default: return type === WidgetPanelTypes.LEFT ? <VEI1Orange/> : <VEI1Blue/>;
    }
  }

  private getVEIDescription = (vei: number) => {
    return ((kVEIIndexInfo[vei] && kVEIIndexInfo[vei].description) || "");
  }

}
