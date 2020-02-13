import * as React from "react";
import { PureComponent } from "react";
import Button from "@material-ui/core/Button";

import "../css/overlay-button.css";

interface IProps {
  onClick: any;
  disabled: any;
  icon: any;
  className: string;
  title: string;
  dataTest: any;
  color: "inherit" | "primary" | "secondary" | "default" | undefined;
}

interface IState {}

export default class OverlayButton extends PureComponent<IProps, IState> {
  public static defaultProps = {
    onClick: undefined,
    disabled: undefined,
    icon: undefined,
    className: "",
    title: undefined,
    dataTest: undefined,
    color: "secondary"
  };

  public render() {
    const { onClick, disabled, children, icon, className, title, dataTest, color } = this.props;
    const iconComponent = typeof icon === "string" ? <i className={`fa fa-${icon}`} /> : icon;
    return (
      <Button
        variant="contained"
        color={color}
        className={`overlay-button ${className} ${icon && !children ? "icon-only" : ""}`}
        title={title}
        disabled={disabled}
        onClick={onClick}
      >
        {iconComponent}
        {children}
      </Button>
    );
  }
}
