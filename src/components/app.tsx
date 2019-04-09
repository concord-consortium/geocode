import { inject, observer } from "mobx-react";
import * as React from "react";
import { BaseComponent, IBaseProps } from "./base";
import { MapComponent } from "./map-component";
import { CrossSectionComponent } from "./cross-section-component";

import BlocklyContianer from "./blockly-container";
import { simulation } from "../stores/volcano-store";
import styled from "styled-components";
import { Tab, Tabs, TabList, TabPanel } from "./tabs";
import { js_beautify } from "js-beautify";
import SyntaxHighlighter from "react-syntax-highlighter";
import Controls from "./controls";

interface IProps extends IBaseProps {}

interface IState {}

const App = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    flex-direction: row;
    margin-top: 50px;
`;

const Simulation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const Code = styled.div`
  width: 800px;
  max-height: 600px;
  overflow: auto;
  padding: 1em;
`;

const Hidden = styled.div`
  display: inline;
`;

@inject("stores")
@observer
export class AppComponent extends BaseComponent<IProps, IState> {
  public render() {
    const {
      mass,
      windDirection,
      windSpeed,
      code,
      setBlocklyCode,
      colHeight,
      particleSize,
      numCols,
      numRows,
      data,
      cities,
      cityHash,
      volcanoX,
      volcanoY
    } = this.stores;

    return (
      <App>
        <Tabs>
          <TabList>
            <Tab>Blocks</Tab>
            <Tab>Code</Tab>
          </TabList>
          <TabPanel>
            <BlocklyContianer
              width={800}
              height={600}
              setBlocklyCode={ setBlocklyCode} />
          </TabPanel>
          <TabPanel>
            <Code>
              <SyntaxHighlighter>
                {js_beautify(code)}
              </SyntaxHighlighter>
            </Code>
          </TabPanel>
        </Tabs>

        <Simulation >
          <MapComponent
            windDirection={ windDirection }
            windSpeed={ windSpeed }
            mass={ mass }
            colHeight={ colHeight }
            particleSize={ particleSize }
            numCols={ numCols }
            numRows={ numRows }
            width={ 500 }
            height={ 500 }
            data={ data }
            cities={ cities }
            volcanoX={ volcanoX }
            volcanoY={ volcanoY }
          />
          <CrossSectionComponent
            data={ data }
            height={ 200 }
            numCols={ numCols }
            numRows={ numRows }
            width={ 500 }
            volcanoX={ volcanoX }
          />
          <Controls />
        </Simulation>

      </App>
    );
  }

}
