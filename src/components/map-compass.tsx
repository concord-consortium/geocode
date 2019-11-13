import * as React from "react";
import styled from "styled-components";
import { Icon } from "./icon";
import PointerIcon from "../assets/map-icons/pointer.svg";

const CompassContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 19px;
  right: 12px;
`;

const CompassText = styled.div`
  color: #434343;
  font-size: 12px;
`;

function CompassComponent() {
  return (
    <CompassContainer>
      <Icon
        width={11}
        height={16}
        fill={"black"}
      >
        <PointerIcon />
      </Icon>
      <CompassText>N</CompassText>
    </CompassContainer>
  );
}

export default CompassComponent;
