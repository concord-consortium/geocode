import styled from "styled-components";

interface IconProps {
  width: number;
  height: number;
  fill: string;
}
const Icon = styled.div`
  width: ${(p: IconProps) => `${p.width}px`};
  height: ${(p: IconProps) => `${p.height}px`};
  fill: ${(p: IconProps) => `${p.fill}`};
`;

export { IconProps, Icon };
