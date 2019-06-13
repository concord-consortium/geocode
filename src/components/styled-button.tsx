import styled from "styled-components";

export const StyledButton = styled.div`
  padding: 0.25em;
  margin: 0.25em;
  border: 1px solid hsl(0, 0%, 25%);
  border-radius: 0.2em;
`;

export const HighliteButton = styled(StyledButton)`
  background-color: ${(p: {selected?: boolean}) => p.selected ? "black" : "white"};
  color: ${(p: {selected?: boolean}) => p.selected ? "white" : "black"};
`;
