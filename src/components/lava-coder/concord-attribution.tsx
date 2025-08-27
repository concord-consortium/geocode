import { useEffect, useRef } from "react";
import ConcordLogo from "../../assets/concord.png";

import "./concord-attribution.scss";

export function ConcordAttribution() {
  const attributionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // hide cesium "upgrade for commercial use" link
    const parent = attributionRef.current?.closest(".lava-coder-view");
    const cesiumUpgradeTextContainer = parent?.querySelector<HTMLDivElement>(".cesium-credit-textContainer");
    if (cesiumUpgradeTextContainer) {
      cesiumUpgradeTextContainer.style.display = "none";
    }
  });

  return (
    <>
      <div className="cesium-attribution-overlay" aria-hidden="true" />
      <div className="concord-attribution" ref={attributionRef}>
        <img src={ConcordLogo} alt="Concord Consortium Logo" />
        <span>Concord Consortium</span>
      </div>
    </>
  );
}
