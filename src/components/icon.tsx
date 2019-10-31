import styled from "styled-components";

interface IconProps {
  width: number;
  height: number;
  fill: string;
  disabled?: boolean;
}
const Icon = styled.div`
  width: ${(p: IconProps) => `${p.width}px`};
  height: ${(p: IconProps) => `${p.height}px`};
  fill: ${(p: IconProps) => `${p.fill}`};
  opacity: ${(p: IconProps) => p.disabled ? ".25" : "1"};
`;

export { Icon };
