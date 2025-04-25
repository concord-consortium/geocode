import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import RunButtons from "./run-buttons";

describe("RunButtons component", () => {
  it("renders all the buttons", () => {
    const nullfunc = () => null;

    const { container } = render(
      <RunButtons
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
      />
    );

    expect(screen.getByText("Run")).toBeInTheDocument();
    expect(screen.getByText("Step")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("Reload")).toBeInTheDocument();
  });
});
