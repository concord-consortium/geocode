import styled from "styled-components";

interface IconButtonProps {
  hovercolor: string;
  activecolor: string;
}
const IconButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 83px;
  height: 34px;
  border-radius: 5px;
  background-color: white;
  border: solid 2px white;
  margin: 0 4px 0 4px;
  &:hover {
    background-color: ${(p: IconButtonProps) => `${p.hovercolor}`};
  }
  &:active {
    background-color: ${(p: IconButtonProps) => `${p.activecolor}`};
  }
`;

const IconButtonText = styled.div`
  margin-left: 4px;
  color: #434343;
  font-size: 16px;
`;

export { IconButton, IconButtonText };
