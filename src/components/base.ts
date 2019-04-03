import * as React from "react";
import { SimulationModelType } from "../stores/volcano-store";

export interface IBaseProps {
  stores?: SimulationModelType;
}

export class BaseComponent<P, S> extends React.Component<P, S> {

  // this assumes that stores are injected by the classes that extend BaseComponent
  get stores() {
    return (this.props as IBaseProps).stores as SimulationModelType;
  }

}
