import ConcordLogo from "../../assets/concord.png";

import "./concord-attribution.scss";

export function ConcordAttribution() {
  return (
    <>
      <div className="cesium-attribution-overlay" />
      <div className="concord-attribution">
        <img src={ConcordLogo} alt="Concord Consortium Logo" />
        <span>Concord Consortium</span>
      </div>
    </>
  );
}
