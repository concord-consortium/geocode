import { uiStore } from "../../stores/ui-store";
import { kWidgetPanelInfo } from "../../utilities/widget";
import { RelativeIconContainer, ValueContainer, ValueOutput } from "../styled-containers";

import LavaFront1 from "../../assets/lava-coder/widget-lava-front-height-1@3x.png";
import LavaFront2 from "../../assets/lava-coder/widget-lava-front-height-2@3x.png";
import LavaFront3 from "../../assets/lava-coder/widget-lava-front-height-3@3x.png";
import LavaFront4 from "../../assets/lava-coder/widget-lava-front-height-4@3x.png";
import LavaFront5 from "../../assets/lava-coder/widget-lava-front-height-5@3x.png";
import LavaFront6 from "../../assets/lava-coder/widget-lava-front-height-6@3x.png";
import LavaFront7 from "../../assets/lava-coder/widget-lava-front-height-7@3x.png";
import LavaFront8 from "../../assets/lava-coder/widget-lava-front-height-8@3x.png";
import LavaFront9 from "../../assets/lava-coder/widget-lava-front-height-9@3x.png";
import LavaFront10 from "../../assets/lava-coder/widget-lava-front-height-10@3x.png";

const lavaFrontIcons = [
  LavaFront1, LavaFront2, LavaFront3, LavaFront4, LavaFront5,
  LavaFront6, LavaFront7, LavaFront8, LavaFront9, LavaFront10
];

interface LavaFrontHeightWidgetProps {
  lavaFrontHeight: number;
}
export function LavaFrontHeightWidget({ lavaFrontHeight }: LavaFrontHeightWidgetProps) {
  const { minLavaFrontHeight, maxLavaFrontHeight } = uiStore;
  const lavaFrontHeightRange = maxLavaFrontHeight - minLavaFrontHeight;
  const iconIndex = Math.floor((lavaFrontHeight - minLavaFrontHeight) / lavaFrontHeightRange * lavaFrontIcons.length);
  const lavaFrontIcon = lavaFrontIcons[Math.max(0, Math.min(iconIndex, lavaFrontIcons.length - 1))];

  return (
    <ValueContainer backgroundColor={kWidgetPanelInfo.right.backgroundColor}>
      <RelativeIconContainer>
        <img
          src={lavaFrontIcon}
          alt={`Lava front height: ${lavaFrontHeight}m`}
          style={{ height: 49, width: 90 }}
        />
      </RelativeIconContainer>
      <ValueOutput>
        <div data-test="info">{lavaFrontHeight} m</div>
      </ValueOutput>
    </ValueContainer>
  );
}
