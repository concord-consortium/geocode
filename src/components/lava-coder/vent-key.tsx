import "./vent-key.scss";

export function VentKey() {
  return (
    <div className="vent-key-container">
      <div className="description">
        <div className="description-line">Likelihood</div>
        <div className="description-line">of Vent Location</div>
      </div>
      <div className="item">
        <div className="item-box very-likely" />
        <div className="item-label">Very Likely</div>
      </div>
      <div className="item">
        <div className="item-box likely" />
        <div className="item-label">Likely</div>
      </div>
    </div>
  );
}
