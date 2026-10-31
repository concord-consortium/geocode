import "./progress-bar.scss";

interface ProgressBarProps {
  pulseCount: number;
  pulses: number;
  /** Run being shown, if any. The bar widens to fit the longer label. */
  runNumber?: number;
}
export function ProgressBar({ pulseCount, pulses, runNumber }: ProgressBarProps) {
  const style = { width: `${pulseCount / pulses * 100}%` };
  // Once the bar is full the eruption is done, so the label says so rather than still reading
  // "progress". Every run fires exactly `pulses` pulses, so this flips reliably.
  const complete = pulses > 0 && pulseCount >= pulses;
  const withRun = (text: string) => runNumber != null ? `Run ${runNumber} - ${text}` : text;
  const progressLabel = withRun("Eruption progress");
  const completeLabel = withRun("Eruption complete");
  return (
    <div className="progress-bar-area">
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div className="fill" style={style} />
          <div className="outline" />
          {/* Both labels are laid on top of each other so the bar is always as wide as the
              wider one. Without this it twitches a few pixels at the moment it completes. */}
          <div className="label">
            <span className="label-text">{complete ? completeLabel : progressLabel}</span>
            <span className="label-sizer" aria-hidden="true">{progressLabel}</span>
            <span className="label-sizer" aria-hidden="true">{completeLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
