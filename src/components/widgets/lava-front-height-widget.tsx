import styled from "styled-components";
import { minResidual, rangeResidual } from "../lava-coder/lava-constants";
import { ValueContainer, ValueOutput, IconContainer } from "../styled-containers";
import { kWidgetPanelInfo } from "../../utilities/widget";

import LavaFront1 from "../../assets/lava-coder/widget-lava-front-height-1.png";
import LavaFront2 from "../../assets/lava-coder/widget-lava-front-height-2.png";
import LavaFront3 from "../../assets/lava-coder/widget-lava-front-height-3.png";
import LavaFront4 from "../../assets/lava-coder/widget-lava-front-height-4.png";
import LavaFront5 from "../../assets/lava-coder/widget-lava-front-height-5.png";
import LavaFront6 from "../../assets/lava-coder/widget-lava-front-height-6.png";
import LavaFront7 from "../../assets/lava-coder/widget-lava-front-height-7.png";
import LavaFront8 from "../../assets/lava-coder/widget-lava-front-height-8.png";
import LavaFront9 from "../../assets/lava-coder/widget-lava-front-height-9.png";
import LavaFront10 from "../../assets/lava-coder/widget-lava-front-height-10.png";

const lavaFrontIcons = [
  LavaFront1, LavaFront2, LavaFront3, LavaFront4, LavaFront5,
  LavaFront6, LavaFront7, LavaFront8, LavaFront9, LavaFront10
];

const RelativeIconContainer = styled(IconContainer)`
  align-items: center;
  display: flex;
  justify-content: center;
  position: relative;
`;

interface LavaFrontHeightWidgetProps {
  lavaFrontHeight: number;
}
export function LavaFrontHeightWidget({ lavaFrontHeight }: LavaFrontHeightWidgetProps) {
  const iconIndex = Math.floor((lavaFrontHeight - minResidual) / rangeResidual * lavaFrontIcons.length);
  const lavaFrontIcon = lavaFrontIcons[Math.max(0, Math.min(iconIndex, lavaFrontIcons.length - 1))];

  return (
    <ValueContainer backgroundColor={kWidgetPanelInfo.right.backgroundColor}>
      <RelativeIconContainer>
        <img src={lavaFrontIcon} alt={`Lava front height: ${lavaFrontHeight}m`} />
      </RelativeIconContainer>
      <ValueOutput>
        <div data-test="info">{lavaFrontHeight} m</div>
      </ValueOutput>
    </ValueContainer>
  );
}
