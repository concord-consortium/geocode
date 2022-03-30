import * as React from "react";
import { BaseComponent } from "../../base";
import styled from "styled-components";
import { PlateDiv } from "../plate-movement-panel";
import SpeedDirectionWidget from "../../widgets/speed-direction-widget";
import { WidgetPanelTypes } from "../../../utilities/widget";

export const DialogContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  box-sizing: border-box;
  width: 150px;
  height: auto;
  top: 0px;
  border-radius: 5px;
  background-color: #e6f2e4;
  border: 2px solid #fff;
  padding: 5px;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.35);
  text-align: center;
`;

interface IProps{
    run?: number;
};
interface IState{};

export class InnerDialog extends BaseComponent<IProps, IState>{
    render(){
        const { run } = this.props;
        return (
            <div>
            <p>Block Inputs</p>
            <p>{"Run " + run}</p>
            <PlateDiv>Plate 1</PlateDiv>
            <SpeedDirectionWidget
                type={WidgetPanelTypes.RIGHTDEFORMATIONPLATE1}
                showWindDirection={true}
                showWindSpeed={true}
                windDirection={180}
                windSpeed={35}
                showWindSymbolIcon={false}
                speedUnits={"mm/y"}
                maxWindSpeed={50}
                showAngleMarkers={true}
                orientArrowFromAngle={false}
                showBorder={true}
          />
            <PlateDiv>Plate 2</PlateDiv>
            <SpeedDirectionWidget
                type={WidgetPanelTypes.RIGHTDEFORMATIONPLATE2}
                showWindDirection={true}
                showWindSpeed={true}
                windDirection={180}
                windSpeed={35}
                showWindSymbolIcon={false}
                speedUnits={"mm/y"}
                maxWindSpeed={50}
                showAngleMarkers={true}
                orientArrowFromAngle={false}
                showBorder={true}
          />
          <p>Friction</p>
          <p>Low</p>
            </div>
        )
    }
}