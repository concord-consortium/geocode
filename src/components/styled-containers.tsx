import styled from "styled-components";

interface HorizontalContainerProps {
  alignItems?: string;
  justifyContent?: string;
}
export const HorizontalContainer = styled.div`
  display: flex;
  align-items: ${(p: HorizontalContainerProps) => `${p.alignItems ? p.alignItems : "flex-start"}`};
  justify-content: ${(p: VerticalContainerProps) => `${p.alignItems ? p.alignItems : "flex-start"}`};
`;

interface VerticalContainerProps {
  alignItems?: string;
  justifyContent?: string;
}
export const VerticalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(p: VerticalContainerProps) => `${p.alignItems ? p.alignItems : "flex-start"}`};
  justify-content: ${(p: VerticalContainerProps) => `${p.alignItems ? p.alignItems : "flex-start"}`};
`;

interface ValueContainerProps {
  width?: number;
  backgroundColor?: string;
}
export const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: ${(p: ValueContainerProps) => `${p.width ? `${p.width}px` : "104px"}`};
  height: 80px;
  margin-left: auto;
  padding: 2px;
  border-radius: 7px;
  color: #434343;
  background-color: ${(p: ValueContainerProps) => `${p.backgroundColor ? `${p.backgroundColor}` : "#FFDBAC"}`};
  font-size: 12px;
`;

export const ValueOutput = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 21px;
  border-radius: 0 0 5px 5px;
  background-color: white;
  text-align: center;
`;

export const IconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60px;
  margin: 0 10px 0 10px;
`;
