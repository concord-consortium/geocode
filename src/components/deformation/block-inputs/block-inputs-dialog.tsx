import * as React from "react";
import { BaseComponent } from "../../base";
import styled from "styled-components";
import SpeedDirectionWidget from "../../widgets/speed-direction-widget";
import { WidgetPanelTypes } from "../../../utilities/widget";
import { IDeformationRuns } from "../../../stores/seismic-simulation-store";

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

const InnerDiv = styled.div`
  margin: 5px 5px 5px 5px;
  font-size: 16px;
  font-weight: normal;
`;

const TitleDiv = styled(InnerDiv)`
  margin: 15px 5px 5px 5px;
`;

const FrictionText = styled(InnerDiv)`
  font-size: 14px;
`;

interface IProps{
    runNumber: number;
    deformationHistory: IDeformationRuns;
}

interface IState{}

const toTitleCase = (str: string) => {
    return str[0].toUpperCase() + str.slice(1);
};

export class InnerDialog extends BaseComponent<IProps, IState>{
    public render(){
        const { runNumber, deformationHistory } = this.props;
        const currentRun = deformationHistory.filter(run => run.group === runNumber)[0];
        return (
            <div>
                { deformationHistory.length && runNumber! > 0 && currentRun ?
                    <div>
                        <InnerDiv>Block Inputs</InnerDiv>
                        <InnerDiv>{"Run " + runNumber}</InnerDiv>
                        <TitleDiv>Plate 1</TitleDiv>
                        <SpeedDirectionWidget
                            type={WidgetPanelTypes.RIGHTDEFORMATIONPLATE1}
                            showWindDirection={true}
                            showWindSpeed={true}
                            windDirection={0}
                            windSpeed={currentRun.deformationModelInfo.plate1Speed}
                            showWindSymbolIcon={false}
                            speedUnits={"mm/y"}
                            maxWindSpeed={50}
                            showAngleMarkers={true}
                            orientArrowFromAngle={false}
                            showBorder={true}
                        />
                        <TitleDiv>Plate 2</TitleDiv>
                        <SpeedDirectionWidget
                            type={WidgetPanelTypes.RIGHTDEFORMATIONPLATE2}
                            showWindDirection={true}
                            showWindSpeed={true}
                            windDirection={180}
                            windSpeed={currentRun.deformationModelInfo.plate2Speed}
                            showWindSymbolIcon={false}
                            speedUnits={"mm/y"}
                            maxWindSpeed={50}
                            showAngleMarkers={true}
                            orientArrowFromAngle={false}
                            showBorder={true}
                        />
                        <TitleDiv>Friction</TitleDiv>
                        <FrictionText>{currentRun.deformationModelInfo.friction}</FrictionText>
                    </div>
                : <div/> }
            </div>
        );
    }
}
