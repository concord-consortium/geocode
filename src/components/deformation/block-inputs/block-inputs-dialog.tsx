import * as React from "react";
import { BaseComponent } from "../../base";
import styled from "styled-components";
import { PlateDiv } from "../plate-movement-panel";
import SpeedDirectionWidget from "../../widgets/speed-direction-widget";
import { WidgetPanelTypes } from "../../../utilities/widget";
import { IDeformationRuns, IDeformationModelInfo } from "../../../stores/seismic-simulation-store";

export const DialogContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 7;
  align-items: center;
  position: absolute;
  box-sizing: border-box;
  width: 150px;
  height: auto;
  min-height: 50px;
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
    deformationHistory: IDeformationRuns;
    currentRun: IDeformationModelInfo;
};
interface IState{};

export class InnerDialog extends BaseComponent<IProps, IState>{
    public render(){
        const { run, deformationHistory, currentRun } = this.props;
        return (
            <div>
                { deformationHistory.length && run! > 0 ? 
                    <div>
                        <p>Block Inputs</p>
                        <p>{"Run " + run}</p>
                        <PlateDiv>Plate 1</PlateDiv>
                        <SpeedDirectionWidget
                            type={WidgetPanelTypes.RIGHTDEFORMATIONPLATE1}
                            showWindDirection={true}
                            showWindSpeed={true}
                            windDirection={0}
                            windSpeed={currentRun.plate1Speed}
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
                            windSpeed={currentRun.plate2Speed}
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
                : <div/> }
            </div> 
        );
    }
}
