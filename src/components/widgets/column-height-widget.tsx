import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "../icon";
import ColumnHeightIcon from "../../assets/widget-icons/column-height.svg";
import { ValueContainer, ValueOutput, IconContainer } from "../styled-containers";
import { WidgetPanelTypes, kWidgetPanelInfo } from "../../utilities/widget";

interface CoverProps {
  height?: number;
  backgroundColor?: string;
}
const Cover = styled.div<CoverProps>`
  position: absolute;
  background-color: ${(p: CoverProps) => `${p.backgroundColor ? `${p.backgroundColor}` : "#FFDBAC"}`};
  height: ${(p: CoverProps) => `${p.height ? `${p.height}px` : "0px"}`};
  width: 20px;
  top: 2px;
`;

interface GuageProps {
  height?: number;
  color?: string;
}
const Guage = styled.div<GuageProps>`
  position: absolute;
  border-style: solid;
  border-color: ${(p: GuageProps) => `${p.color ? `${p.color}` : "#ff9300"}`};
  border-width: 2px 2px 2px 0;
  height: ${(p: GuageProps) => `${p.height ? `${p.height}px` : "0px"}`};
  width: 4px;
  left: 35px;
  bottom: 7px;
`;

const RelativeIconContainer = styled(IconContainer)`
  position: relative;
  height: 60px;
`;

interface IProps {
  type: WidgetPanelTypes;
  columnHeightInKilometers: number;
}

interface IState {}

export default class ColumnHeightWidget extends PureComponent<IProps, IState> {
  public static defaultProps = {
    type: WidgetPanelTypes.LEFT,
    columnHeightInKilometers: 1,
  };

  public render() {
    const minColumnHeight = .5;
    const maxColumnHeight = 25;
    const maxGuageHeight = 48;
    const maxCoverHeight = 50;
    const { columnHeightInKilometers, type } = this.props;
    const constrainedColumnHeight = Math.min(Math.max(columnHeightInKilometers, minColumnHeight), maxColumnHeight);
    const guageHeight = maxGuageHeight * (constrainedColumnHeight) / maxColumnHeight;
    const coverHeight = maxCoverHeight - (maxCoverHeight * constrainedColumnHeight / maxColumnHeight);
    return (
      <ValueContainer backgroundColor={kWidgetPanelInfo[type].backgroundColor}>
        <RelativeIconContainer>
          <Icon
            width={37}
            height={55}
            fill={"black"}
          >
            <ColumnHeightIcon/>
          </Icon>
          <Cover height={coverHeight} backgroundColor={kWidgetPanelInfo[type].backgroundColor} />
          <Guage height={guageHeight} color={kWidgetPanelInfo[type].highlightColor} data-test="column-height-visual"/>
        </RelativeIconContainer>
        <ValueOutput  data-test="info">
          {columnHeightInKilometers} km
        </ValueOutput>
      </ValueContainer>
    );
  }

}
