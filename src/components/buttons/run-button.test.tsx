import * as React from "react";
import RunButtons from "./run-buttons";
import { shallow } from "enzyme";

describe("RunButtons component", () => {
  it("renders all the buttons", () => {
    const nullfunc = () => null;
    const wrapper = shallow(<RunButtons
      run={nullfunc}
      stop={nullfunc}
      step={nullfunc}
      reset={nullfunc}
      pause={nullfunc}
      unpause={nullfunc}
      reload={nullfunc}
      setSpeed={nullfunc}
      isAtInitialState={false}
      running={false}
      paused={false}
      showSpeedControls={false}
      speed={0}
    />);
    expect(wrapper.contains("<RunButton />"));
    expect(wrapper.contains("<StopButton />"));
    expect(wrapper.contains("<StepButton />"));
    expect(wrapper.contains("<ResetButton />"));
  });
});
