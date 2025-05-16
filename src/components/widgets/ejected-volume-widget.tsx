import styled from "styled-components";
import { Icon } from "../icon";
import BoxBackIcon from "../../assets/widget-icons/ejected-volume-box-back.svg";
import BoxFrontIcon from "../../assets/widget-icons/ejected-volume-box-front.svg";
import BoxTopIcon from "../../assets/widget-icons/ejected-volume-box-top.svg";
import { ValueContainer, ValueOutput, IconContainer } from "../styled-containers";
import { WidgetPanelTypes, kWidgetPanelInfo } from "../../utilities/widget";
import { maxEruptionVolume, minEruptionVolume } from "../lava-coder/lava-constants";

interface BoxProps {
  height?: number;
}
const BoxLeft = styled.div<BoxProps>`
  position: absolute;
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
  mode: "tephra" | "molasses";
  type: WidgetPanelTypes;
  eruptionVolume: number; // in km^3 for tephra, m^3 for lava
}

export default function EjectedVolumeWidget({ mode, type, eruptionVolume }: IProps) {
  const unit = mode === "tephra" ? "km" : "m";
  const minVolume = mode === "tephra" ? .0001 : minEruptionVolume;
  const maxVolume = mode === "tephra" ? 1000 : maxEruptionVolume;
  const constrainedVolume = Math.min(Math.max(eruptionVolume, minVolume), maxVolume);
  const index = Math.round(Math.log(eruptionVolume) / Math.LN10);
  const constrainedIndex = Math.round(Math.log(constrainedVolume) / Math.LN10);
  const maxBoxGrowth = 33;
  const minBoxHeight = 1;
  const indexOffset = mode === "tephra" ? 4 : -6;
  const maxIndex = mode === "tephra" ? 7 : 4;
  const boxHeight = minBoxHeight + maxBoxGrowth
                    * (Math.pow(2, constrainedIndex + indexOffset) / Math.pow(2, maxIndex));
  const topOffset = 25;
  const boxLeftBackgroundColor = mode === "tephra" ? "#B9B9B9" : "#f09546";
  const boxRightBackgroundColor = mode === "tephra" ? "#B9B9B9" : "#e07d32";
  const boxTopColor = mode === "tephra" ? "#bebebe" : "#f4b77d";

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
        <BoxLeft style={{ backgroundColor: boxLeftBackgroundColor }} height={boxHeight} />
        <BoxRight style={{ backgroundColor: boxRightBackgroundColor }} height={boxHeight} />
        <AbsoluteIconTop
          width={54}
          height={48}
          fill={"black"}
          bottom={boxHeight - topOffset}
        >
          <BoxTopIcon color={boxTopColor} />
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
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={
            {__html: `10<sup>${index}</sup> ${unit}<sup>3</sup>`}
        } />
      </ValueOutput>
    </ValueContainer>
  );
}
