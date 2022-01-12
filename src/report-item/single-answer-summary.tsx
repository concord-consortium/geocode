import * as React from "react";
import styled from "styled-components";

import { IReportItemInitInteractive } from "@concord-consortium/lara-interactive-api";
import { InitMessageInfoComponent } from "./init-message-info";
import { SerializedState, serializeState } from "../stores/stores";
import { TephraSimulationModelType } from "../stores/tephra-simulation-store";
import { SeismicSimulationModelType } from "../stores/seismic-simulation-store";

const Title = styled.h1`
  font-family: helvetica, arial, sans-serif;
  color: #0592af;
  font-size: 14pt;
  font-weight: bold;
`;

const Container = styled.div<{vertical: boolean}>`
  font-family: helvetica, arial, sans-serif;
  display: flex;
  flex-direction: ${props => props.vertical ? "column" : "row" };
  align-items: ${props => props.vertical ? "flex-start" : "center" };
  justify-content: space-between;
`;

const AuthoredInfo = (props: {authoredState: SerializedState|null}) => {
  const { authoredState } = props;
  if (authoredState !== null) {
    const {version, state} = authoredState;
    const { unit} = state;

    const scenario = unit.name === "Tephra"
      ? (state.tephraSimulation as TephraSimulationModelType).scenario
      : (state.seismicSimulation as SeismicSimulationModelType).scenario;

    return <Title>{unit.name}: {scenario}</Title>;
  }
  return(null);
};

interface Props {
  initMessage: IReportItemInitInteractive;
  authoredState: SerializedState | null;
  mode: "singleAnswer" | "multipleAnswer";
  numAnswers: number;
}

export const SingleAnswerSummaryComponent: React.FC<Props> = (props) => {
  const {authoredState, mode, initMessage, numAnswers} = props;
  const orientation = mode === "singleAnswer" ? "vertical" : "horizontal";
  const viewName = mode === "singleAnswer" ? "single answer" : "multiple answer";
  const numStudents = Object.keys(initMessage.users).length;
  return (
    <>
      <Container vertical={orientation === "vertical"}>
        <Title>GeoCode {viewName} Blockly Report</Title>
        <AuthoredInfo authoredState={authoredState} />
        { mode === "multipleAnswer" &&
          <Title>Student answers: {numAnswers}/{numStudents}</Title>
        }
        {/*
          Debug init message:
          <InitMessageInfoComponent initMessage={initMessage} />
        */}
      </Container>
    </>
  );
};
