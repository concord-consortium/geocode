import styled from "styled-components";

interface IButtonProps {
  running?: boolean;
  color?: string;
  top?: number;
  run?: number;
  typeOfButton?: string;
  onClick?: any;
  activeRun?: number | null;
  disabled?: boolean;
}

export const ButtonContainer = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  box-sizing: border-box;
  width: auto;
  height: auto;
  top: ${(p: IButtonProps) => p.top + "px"};
  border-radius: 5px;
  background-color: white;
  border: ${p => "solid 2px" + p.color};
  padding: 5px;
  box-shadow: ${p => p.running ? "none" : "1px 1px 4px 0 rgba(0, 0, 0, 0.35)"};
  &:hover {
    background-color: ${p => { if (!p.disabled) return p.color; }};
    border: ${p => { if (!p.disabled) return "solid 2px #FFF"; }};
  };
  &:hover .buttonText {
    color: ${p => { if (!p.disabled) return "#000"; }};
  };
  &:active {
    background-color: ${p => { if (!p.disabled) return "#e6f2e4"; }};
    border: ${p => { if (!p.disabled) return "2px solid #FFF"; }};
  };
  cursor: ${p => !p.disabled ? "default" : "pointer"};
`;

export const RunButtonContainer = styled(ButtonContainer)`
  background-color: ${p => { if (p.activeRun && p.activeRun === p.run) return p.color; }};
  &:hover .buttonText {
    color: ${p => { if (!p.disabled) return "#FFF"; }};
  }
  &:active {
    background-color: ${p => { if (!p.disabled) return p.color; }};
    border: ${p => { if (!p.disabled) return "2px solid" + p.color; }};
  }
`;

export const ButtonText = styled.div`
  color: ${ (p: IButtonProps) => {
    if (p.activeRun && p.activeRun === p.run){
      return "white";
    } else if (p.typeOfButton === "run" && p.activeRun !== p.run){
      return p.color;
    } else {
      return "black";
    }
  }};
  opacity: ${p => p.running ? "25%" : "100%"};
  font-size: 16px;
`;
