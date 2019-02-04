import * as React from "react";
import styled from "styled-components";
import { runReactions } from "mobx/lib/internal";

interface IProps {}
interface IState {}

const Wrapper = styled.div`
  font-family: sans-serif;
  background-color: teal;
  width: 100%;
  height: 400px;
  position: relative;
`;

export default class BlocklyContainer extends React.Component<IProps, IState> {
  public render() {
    return (
      <Wrapper>
        testing.
      </Wrapper>
    );
  }
  public componentDidMount() {
    console.log("component did mount");
    this.initializeBlockly();
  }

  public componentDidUpdate() {
    console.log("component did update");
    this.initializeBlockly();
  }

  private initializeBlockly = () => {
    return true;
  }

}
