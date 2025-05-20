import styled from "styled-components";
import { kWidgetPanelInfo } from "../../utilities/widget";
import { RelativeIconContainer, ValueContainer, ValueOutput } from "../styled-containers";

import VentLocationIcon from "../../assets/lava-coder/widget-vent-location@3x.png";

export const VerticalValueOutput = styled(ValueOutput)`
  flex-direction: column;
  height: 38px;
`;

const niceDegrees = (value: number) => `${value.toFixed(3)}°`;

interface VentLocationWidgetProps {
  latitude: number;
  longitude: number;
}
export function VentLocationWidget({ latitude, longitude }: VentLocationWidgetProps) {
  return (
    <ValueContainer backgroundColor={kWidgetPanelInfo.right.backgroundColor}>
      <RelativeIconContainer>
        <img
          src={VentLocationIcon}
          alt={`Vent latitude: ${latitude}, longitude: ${longitude}`}
          style={{ height: "28px", width: "28px" }}
        />
      </RelativeIconContainer>
      <VerticalValueOutput>
        <div data-test="lat-info">{`Lat: ${niceDegrees(latitude)}`}</div>
        <div data-test="long-info">{`Long: ${niceDegrees(longitude)}`}</div>
      </VerticalValueOutput>
    </ValueContainer>
  );
}
