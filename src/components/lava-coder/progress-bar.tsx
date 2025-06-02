import "./progress-bar.scss";

interface ProgressBarProps {
  pulseCount: number;
  pulses: number;
}
export function ProgressBar({ pulseCount, pulses }: ProgressBarProps) {
  const style = { width: `${pulseCount / pulses * 100}%` };
  return (
    <div className="progress-bar-area">
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div className="fill" style={style} />
          <div className="outline" />
          <div className="label">Eruption progress</div>
        </div>
      </div>
    </div>
  );
}
