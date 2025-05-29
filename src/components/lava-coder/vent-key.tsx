import { useState } from "react";
import CloseIcon from "../../assets/lava-coder/close-icon@3x.png";
import VentKeyIcon from "../../assets/lava-coder/key-icon@3x.png";
import { LavaIconButton } from "./lava-icon-button";

import "./vent-key.scss";

export function VentKey() {
  const [displayKey, setDisplayKey] = useState(false);

  return (
    <div className="vent-key-container">
      {!displayKey && (
        <LavaIconButton className="show-vent-key-button" label="Key" width={24}
                        onClick={() => setDisplayKey(true)}>
          <img src={VentKeyIcon} alt="Show Vent Key" className="vent-key-icon" />
        </LavaIconButton>
      )}

      {displayKey && (
        <>
          <button className="close-button" onClick={() => setDisplayKey(false)}>
            <img src={CloseIcon} alt="Close Key" className="close-icon" />
          </button>
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
        </>
      )}
    </div>
  );
}
