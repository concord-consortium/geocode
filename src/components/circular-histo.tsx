
import * as React from "react";
import styled from "styled-components";
// import { Histogram } from "./histogram";
interface Datum {
  time: any;
  speed: number;
  direction: number;
}

interface IProps {
  data: Datum[];
}

interface IState {
  selectedDatum: Datum | null;
}

const polarToCart = (r: number, angle: number) => {
  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle);
  return {x, y};
};

const randNormal = (min: number = 0, max: number = 1, skew: number = 1) => {
  let u = 0;
  let v = 0;
  // Converting [0,1) to (0,1)
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) num = randNormal(min, max, skew); // resample between 0 and 1 if out of range
  num = Math.pow(num, skew); // Skew
  num *= max - min; // Stretch to fill range
  num += min; // offset to min
  return num;
};

export class CircularHisto extends React.Component<IProps, IState> {
  public static getDerivedStateFromProps(props: IProps, state: IState) {
    const { data } = props;
    state.selectedDatum = data[data.length - 1];
  }

  public state = {selectedDatum: null};

  public render() {
    const ViewBox = {
      left: -50,
      bottom: -50,
      width: 100,
      height: 100
    };
    const { left, bottom, width, height} = ViewBox;
    const viewBoxString = [left, bottom, width, height].join(" ");
    const { data } = this.props;
    const {selectedDatum} = this.state;
    const makeBinF = (numBins: number, min: number, max: number) => {
      const range = max - min;
      const binSize = Math.floor(range / numBins);
      return (d: number) => Math.round(d / binSize) * binSize;
    };
    const directionBinF = makeBinF(12, 0, 360);
    const speedBinF = makeBinF(20, 0, 50);

    const toPoint = (d: Datum, index: number) => {
      const {speed, direction} = d;
      const radPerDeg = 0.0174533;
      const {x, y} = polarToCart(speedBinF(speed) , directionBinF(direction) * radPerDeg);
      const unSelectedFill = "hsla(0, 0%, 0%, 0.1)";
      const selectedFill = "hsla(50, 100%, 50%, 1.0)";
      if (index > data.length) {
        return (
          <circle key={`circ-${index}`}
            onClick={this.handleCircleClick}
            cx={x} cy={y}
            data-select={index} r={2} fill={selectedFill}
          >
            <animate attributeName="r" dur="100sms" values="2;1" repeatCount="indefinite" />
          </circle>
        );
      }
      return (
        <circle key={`circ-${index}`}
          onClick={this.handleCircleClick}
          cx={x} cy={y}
          data-select={index} r={0.6} fill={unSelectedFill}
        />
      );
    };

    return(
      <div>
        <svg viewBox={viewBoxString} width="300" height="300">
          <circle cx={0} cy={0} r={50} fill="none" stroke="black" strokeWidth={0.01} />
          <circle cx={0} cy={0} r={25} fill="none" stroke="black" strokeWidth={0.01} />
          { data.map(toPoint) }
          {selectedDatum && toPoint(selectedDatum!, data.length + 1, true) }
          }
        </svg>
        {selectedDatum &&
          <div>
            <div>Date: {(selectedDatum! as Datum).time }</div>
            <div>Speed: {(selectedDatum! as Datum).speed}</div>
            <div>Direction:  {(selectedDatum! as Datum).direction}</div>
          </div>
        }
      </div>

    );
  }

  private handleCircleClick = (e: React.SyntheticEvent) => {
    const element = e.currentTarget;
    const {data} = this.props;
    const index = element.getAttribute("data-select") as number|null;
    if (index) {
      this.setState({selectedDatum: data[index]});
    } else {
      this.setState({selectedDatum: null});
    }
  }
}

interface IDataContextProps {
  data: Datum[];
}

interface IDataContextState {
  workingSet: Datum[];
  rangeStart: number;
  rangeEnd: number;
}

const HowizontalLayout = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export class HistDataContext extends React.Component<IDataContextProps, IDataContextState>{
  public lastTime = 0;
  public constructor(props: IDataContextProps) {
    super(props);
    const {data} = props;
    const length = data.length;
    this.state = {
      workingSet: [],
      rangeStart: 0,
      rangeEnd: length - 1
    };
  }

  public render() {
    const {workingSet} = this.state;
    return (
      <HowizontalLayout>
        <CircularHisto data={workingSet} />
        {/* <Histogram data={workingSet} /> */}
      </HowizontalLayout>
    );
  }

  public componentDidMount() {
    requestAnimationFrame(this.doTick);
  }

  private addDatumToWorkingSet(d: Datum) {
    const {workingSet} = this.state;
    workingSet.push(d); // TODO remove from set?
    this.setState({ workingSet: workingSet.slice() });
  }

  private addSampleData = () => {
    const {rangeStart, rangeEnd} = this.state;
    const {data} = this.props;
    const selectableRange = rangeEnd - rangeStart;
    const selected = Math.floor(Math.random() * selectableRange) + rangeStart;
    this.addDatumToWorkingSet(data[selected]);
  }

  private addNextData = () => {
    const {workingSet} = this.state;
    const {data} = this.props;
    const nextIndex = workingSet.length > 0 ? workingSet.length : 0;
    this.addDatumToWorkingSet(data[nextIndex]);
  }

  private doTick = (timestamp: number) => {
    if (timestamp > this.lastTime + 100) {
      this.lastTime = timestamp;
      if (this.state.workingSet.length < this.props.data.length) {
        // this.addNextData();
        this.addSampleData();
      }
    }
    requestAnimationFrame(this.doTick);
  }
}
