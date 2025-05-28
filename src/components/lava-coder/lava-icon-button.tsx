import IconButton, { IProps as IIconButtonProps } from "../buttons/icon-button";

interface IProps extends Partial<IIconButtonProps> {
}

export function LavaIconButton(inProps: IProps) {
  const props: IProps = {
    ...inProps,
    height: 34,
    width: 34,
    hoverColor: "#b7dcad",
    activeColor: "#cee6c9",
    borderColor: "#3baa1d"

  };
  return (
    <IconButton {...props} />
  );
}
