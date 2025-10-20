import { uiStore } from "../../stores/ui-store";
import { kWidgetPanelInfo } from "../../utilities/widget";
import { RelativeIconContainer, ValueContainer, ValueOutput } from "../styled-containers";

import LavaThickness1 from "../../assets/lava-coder/widget-lava-thickness-1@3x.png";
import LavaThickness2 from "../../assets/lava-coder/widget-lava-thickness-2@3x.png";
import LavaThickness3 from "../../assets/lava-coder/widget-lava-thickness-3@3x.png";
import LavaThickness4 from "../../assets/lava-coder/widget-lava-thickness-4@3x.png";
import LavaThickness5 from "../../assets/lava-coder/widget-lava-thickness-5@3x.png";
import LavaThickness6 from "../../assets/lava-coder/widget-lava-thickness-6@3x.png";
import LavaThickness7 from "../../assets/lava-coder/widget-lava-thickness-7@3x.png";
import LavaThickness8 from "../../assets/lava-coder/widget-lava-thickness-8@3x.png";
import LavaThickness9 from "../../assets/lava-coder/widget-lava-thickness-9@3x.png";
import LavaThickness10 from "../../assets/lava-coder/widget-lava-thickness-10@3x.png";

const lavaThicknessIcons = [
  LavaThickness1, LavaThickness2, LavaThickness3, LavaThickness4, LavaThickness5,
  LavaThickness6, LavaThickness7, LavaThickness8, LavaThickness9, LavaThickness10
];

interface LavaThicknessWidgetProps {
  lavaThickness: number;
}
export function LavaThicknessWidget({ lavaThickness }: LavaThicknessWidgetProps) {
  const { minLavaThickness, maxLavaThickness } = uiStore;
  const lavaThicknessRange = maxLavaThickness - minLavaThickness;
  const iconIndex = lavaThickness === 0 ? 0
    : Math.floor((lavaThickness - minLavaThickness) / lavaThicknessRange * lavaThicknessIcons.length);
  const lavaThicknessIcon = lavaThicknessIcons[Math.max(0, Math.min(iconIndex, lavaThicknessIcons.length - 1))];

  return (
    <ValueContainer backgroundColor={kWidgetPanelInfo.right.backgroundColor}>
      <RelativeIconContainer>
        <img
          src={lavaThicknessIcon}
          alt={`Lava thickness: ${lavaThickness}m`}
          style={{ height: 49, width: 90 }}
        />
      </RelativeIconContainer>
      <ValueOutput>
        <div data-test="info">{lavaThickness} m</div>
      </ValueOutput>
    </ValueContainer>
  );
}
