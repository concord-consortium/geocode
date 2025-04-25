import React from "react";
import { IStore } from "../stores/stores";

export interface IBaseProps {
  stores?: IStore;
}

export class BaseComponent<P, S> extends React.Component<P, S> {

  // this assumes that stores are injected by the classes that extend BaseComponent
  get stores() {
    return (this.props as IBaseProps).stores as IStore;
  }

}
