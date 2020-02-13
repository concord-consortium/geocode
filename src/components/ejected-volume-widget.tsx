import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "./icon";
import BoxBackIcon from "../assets/widget-icons/ejected-volume-box-back.svg";
import BoxFrontIcon from "../assets/widget-icons/ejected-volume-box-front.svg";
import BoxTopIcon from "../assets/widget-icons/ejected-volume-box-top.svg";
import { ValueContainer, ValueOutput, IconContainer } from "./styled-containers";
import { WidgetPanelTypes, kWidgetPanelInfo } from "../utilities/widget";

interface BoxProps {
  height?: number;
}
const BoxLeft = styled.div<BoxProps>`
  position: absolute;
  background-color: #B9B9B9;
  height: ${(p: BoxProps) => `${p.height ? `${p.height}px` : "0px"}`};
  width: 25px;
  -ms-transform: skewY(13deg); /* IE 9 */
  -webkit-transform: skewY(13deg); /* Safari prior 9.0 */
  transform: skewY(13deg); /* Standard syntax */
  left: -25px;
  bottom: 10px;
`;
const BoxRight = styled.div<BoxProps>`
  position: absolute;
  background-color: #B9B9B9;
  height: ${(p: BoxProps) => `${p.height ? `${p.height}px` : "0px"}`};
  width: 25px;
  -ms-transform: skewY(-13deg); /* IE 9 */
  -webkit-transform: skewY(-13deg); /* Safari prior 9.0 */
  transform: skewY(-13deg); /* Standard syntax */
  left: 0px;
  bottom: 10px;
`;

const RelativeIconContainer = styled(IconContainer)`
  position: relative;
`;
const AbsoluteIcon = styled(Icon)`
  position: absolute;
`;
interface AbsoluteIconTopProps {
  bottom?: number;
}
const AbsoluteIconTop = styled(Icon)`
  position: absolute;
  bottom: ${(p: AbsoluteIconTopProps) => `${p.bottom ? `${p.bottom}px` : "-12px"}`};
`;

interface IProps {
  type: WidgetPanelTypes;
  volumeInKilometersCubed: number;
}

interface IState {}

export default class EjectedVolumeWidget extends PureComponent<IProps, IState> {
  public static defaultProps = {
    type: WidgetPanelTypes.LEFT,
    volumeInKilometersCubed: 1,
  };

  public render() {
    const { type, volumeInKilometersCubed } = this.props;
    const minVolume = .0001;
    const maxVolume = 1000;
    const constrainedVolume = Math.min(Math.max(volumeInKilometersCubed, minVolume), maxVolume);
    const index = Math.round(Math.log(volumeInKilometersCubed) / Math.LN10);
    const constrainedIndex = Math.round(Math.log(constrainedVolume) / Math.LN10);
    const maxBoxGrowth = 33;
    const minBoxHeight = 1;
    const indexOffset = 4;
    const maxIndex = 7;
    const boxHeight = minBoxHeight + maxBoxGrowth
                      * (Math.pow(2, constrainedIndex + indexOffset) / Math.pow(2, maxIndex));
    const topOffset = 25;
    return (
      <ValueContainer backgroundColor={kWidgetPanelInfo[type].backgroundColor}>
        <RelativeIconContainer>
          <AbsoluteIcon
            width={54}
            height={48}
            fill={kWidgetPanelInfo[type].highlightColor}
            data-test="ejected-volume-height-visual"
          >
            <BoxBackIcon/>
          </AbsoluteIcon>
          <BoxLeft height={boxHeight} />
          <BoxRight height={boxHeight} />
          <AbsoluteIconTop
            width={54}
            height={48}
            fill={"black"}
            bottom={boxHeight - topOffset}
          >
            <BoxTopIcon/>
          </AbsoluteIconTop>
          <AbsoluteIcon
            width={54}
            height={48}
            fill={kWidgetPanelInfo[type].highlightColor}
          >
            <BoxFrontIcon/>
          </AbsoluteIcon>
        </RelativeIconContainer>
        <ValueOutput>
          <div data-test="info"
            dangerouslySetInnerHTML={
              {__html: `10<sup>${index}</sup> km<sup>3</sup>`}
          } />
        </ValueOutput>
      </ValueContainer>
    );
  }

}
