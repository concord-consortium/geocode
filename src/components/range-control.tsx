
import React, { CSSProperties } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import styled from "styled-components";

// *******************************************************
// RAIL
// *******************************************************
const railOuterStyle: CSSProperties = {
  position: "absolute",
  width: "100%",
  height: 42,
  transform: "translate(0%, -50%)",
  borderRadius: 7,
  cursor: "pointer",
};

const railInnerStyle: CSSProperties = {
  position: "absolute",
  width: "100%",
  height: 8,
  transform: "translate(0%, -50%)",
  borderRadius: 7,
  pointerEvents: "none",
  borderWidth: "1px",
  borderStyle: "solid"
};

function SliderRail({ getRailProps, backgroundColor, borderColor }: any) {
  const railStyle = {...railInnerStyle,
    backgroundColor: backgroundColor || "#FFAC00",
    borderColor: borderColor || "#FFDBAC"
  };
  return (
    <React.Fragment>
      <div style={railOuterStyle} {...getRailProps()} data-test="slider-rail"/>
      <div style={railStyle} />
    </React.Fragment>
  );
}

// *******************************************************
// HANDLE COMPONENT
// *******************************************************
function Handle({
  domain: [min, max],
  handle: { id, value, percent },
  disabled,
  getHandleProps,
}: any) {
  return (
    <React.Fragment>
      <div
        style={{
          left: `${percent}%`,
          position: "absolute",
          transform: "translate(-50%, -50%)",
          WebkitTapHighlightColor: "rgba(0,0,0,0)",
          zIndex: 5,
          width: 28,
          height: 42,
          cursor: "pointer",
          backgroundColor: "none",
        }}
        {...getHandleProps(id)}
      />
      <div
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{
          left: `${percent}%`,
          position: "absolute",
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          width: 24,
          height: 24,
          borderRadius: "50%",
          boxShadow: "1px 1px 1px 1px rgba(0, 0, 0, 0.3)",
          backgroundColor: disabled ? "#666" : "white",
          borderColor: "#878787",
          borderWidth: "1px",
        }}
      />
    </React.Fragment>
  );
}

Handle.defaultProps = {
  disabled: false,
};

// *******************************************************
// KEYBOARD HANDLE COMPONENT
// Uses a button to allow keyboard events
// *******************************************************
function KeyboardHandle({
  domain: [min, max],
  handle: { id, value, percent },
  disabled,
  getHandleProps,
}: any) {
  return (
    <button
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      style={{
        left: `${percent}%`,
        position: "absolute",
        transform: "translate(-50%, -50%)",
        zIndex: 2,
        width: 20,
        height: 20,
        borderRadius: "50%",
        boxShadow: "1px 1px 1px 1px rgba(0, 0, 0, 0.3)",
        backgroundColor: disabled ? "#666" : "white",
        borderColor: "#878787",
        borderWidth: "1px",
      }}
      {...getHandleProps(id)}
    />
  );
}

KeyboardHandle.defaultProps = {
  disabled: false,
};

// *******************************************************
// TRACK COMPONENT
// *******************************************************
function Track({ source, target, getTrackProps, disabled }: any) {
  return (
    <div
      style={{
        position: "absolute",
        transform: "translate(0%, -50%)",
        height: 14,
        zIndex: 1,
        backgroundColor: disabled ? "#999" : "#b28900",
        borderRadius: 7,
        cursor: "pointer",
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`,
      }}
      {...getTrackProps()}
    />
  );
}

Track.defaultProps = {
  disabled: false,
};

// *******************************************************
// TICK COMPONENT
// *******************************************************
function Tick({ tick, count, format }: any) {
  return (
    <div>
      <div
        style={{
          position: "absolute",
          marginTop: 9,
          width: 2,
          height: 5,
          backgroundColor: "rgb(200,200,200)",
          left: `${tick.percent}%`,
        }}
      />
      <div
        style={{
          position: "absolute",
          marginTop: 13,
          fontSize: 11,
          textAlign: "center",
          marginLeft: `${-(100 / count) / 2}%`,
          width: `${100 / count}%`,
          left: `${tick.percent}%`,
        }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{__html: format(tick.value)}}
      />
    </div>
  );
}

Tick.defaultProps = {
  format: (d: any) => d,
};

const sliderStyle: CSSProperties = {
  position: "relative",
  width: "100%",
};

interface WrapperProps {
  width: number;
}
const Wrapper = styled.div`
  height: 20px;
  width: ${(p: WrapperProps) => `${p.width}px`};
  margin: 16px 10px;
`;

interface IProps {
  min: number;
  max: number;
  value: number;
  step?: number;
  tickArray?: number[];
  tickStep?: number;
  tickMap?: {[k: number]: string};
  width: number;
  onChange: (value: number) => void;
  trackColor?: string;
  trackBorderColor?: string;
}

interface IState {}

class RangeControl extends React.Component<IProps, IState> {

  public onUpdate = (update: number[]) => {
    // round to nearest step-size
    const invStep = 1 / (this.props.step || 1);
    const val = Math.round(update[0] * invStep) / invStep;
    this.props.onChange(val);
  };

  public render() {
    const {
      min,
      max,
      value,
      step,
      tickArray,
      tickStep,
      tickMap,
      width,
      trackColor,
      trackBorderColor
    } = this.props;

    const values = [value];
    const domain = [min, max];
    const stepSize = step || 1;
    let tickMarks: number[] = [];
    let tickFormatter = (val: number) => "" + val;
    if (tickArray) {
      tickMarks = tickArray;
    } else if (tickStep) {
      for (let i = min; i < max; i += tickStep) {
        tickMarks.push(i);
      }
      if (tickMarks[tickMarks.length - 1] !== max) {
        tickMarks.push(max);
      }
    } else if (tickMap) {
      tickMarks = Object.keys(tickMap).map(n => parseFloat(n));
      tickFormatter = (val: number) => tickMap[val] ? tickMap[val] : "";
    }

    return (
      <Wrapper width={width}>
        <Slider
          mode={1}
          step={stepSize}
          domain={domain}
          rootStyle={sliderStyle}
          onUpdate={this.onUpdate}
          values={values}
        >
          <Rail>
            {({ getRailProps }) =>
              <SliderRail getRailProps={getRailProps} backgroundColor={trackColor} borderColor={trackBorderColor}/>}
          </Rail>
          <Handles>
            {({ handles, getHandleProps }) => (
              <div className="slider-handles">
                {handles.map(handle => (
                  <KeyboardHandle
                    key={handle.id}
                    handle={handle}
                    domain={domain}
                    getHandleProps={getHandleProps}
                  />
                ))}
              </div>
            )}
          </Handles>
          <Tracks left={false} right={false}>
            {({ tracks, getTrackProps }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                  <Track
                    key={id}
                    source={source}
                    target={target}
                    getTrackProps={getTrackProps}
                  />
                ))}
              </div>
            )}
          </Tracks>
          <Ticks values={tickMarks}>
            {({ ticks }) => (
              <div className="slider-ticks">
                {ticks.map(tick => (
                  <Tick
                    key={tick.id}
                    tick={tick}
                    count={ticks.length}
                    format={tickFormatter} />
                ))}
              </div>
            )}
          </Ticks>
        </Slider>
      </Wrapper>
    );
  }
}

export default RangeControl;
