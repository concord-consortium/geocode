import styled from "styled-components";

interface IButtonProps {
  running?: boolean;
  color?: string;
  top?: number;
  run?: number;
  typeOfButton?: string;
  onClick?: any;
  activeRun?: number | null;
}

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  box-sizing: border-box;
  width: auto;
  height: auto;
  top: ${ (p: IButtonProps) => p.top + "px" };
  border-radius: 5px;
  background-color: ${(p) => {
    if (p.activeRun && p.activeRun === p.run) {return p.color} 
    else {return "white"}}};
  border: ${ p => "solid 2px" + p.color };
  padding: 5px;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.35);
  &:hover {
    background-color: ${ p => p.color };
    border: solid 2px #FFF;
  }
  &:hover .buttonText {
    color: ${p => p.typeOfButton === "run" ? "#FFF" : "#000"};
  }
  &:active {
    background-color: ${p => p.typeOfButton === "run" ? p.color : "#e6f2e4"};
    border: ${p => p.typeOfButton === "run" ? "2px solid" + p.color : "2px solid #FFF"}
  }
  cursor: pointer;
`;

export const BlockInputsButtonText = styled.div`
  color: ${ (p: IButtonProps) => {
    if (p.activeRun && p.activeRun === p.run){
      return "white";
    } else if (p.typeOfButton === "run" && p.activeRun !== p.run){
      return p.color;
    } else {
      return "black";
    }
  } };
  opacity: ${ p => p.running ? "25%" : "100%" };
  font-size: 16px;
  font-weight: bold;
`;
