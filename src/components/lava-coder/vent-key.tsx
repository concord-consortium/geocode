import { useState } from "react";
import VentKeyIcon from "../../assets/lava-coder/key-icon@3x.png";
import { LavaIconButton } from "./lava-icon-button";

import "./vent-key.scss";

export function VentKey() {
  const [displayKey, setDisplayKey] = useState(false);

  return (
    <div className="vent-key-container">
      {!displayKey && (
        <div className="lava-overlay-controls-top top-right-controls">
          <LavaIconButton className="show-vent-key-button" label="Key" width={24}
                          onClick={() => setDisplayKey(prev => !prev)}>
            <img src={VentKeyIcon} alt="Show Vent Key" className="vent-key-icon" />
          </LavaIconButton>
        </div>
      )}

      {displayKey && (
        <div className="vent-key">
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
      )}
    </div>
  );
}
