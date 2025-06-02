import { useState } from "react";
import { CloseIcon, VentKeyIcon } from "./lava-coder-icons";
import { LavaIconButton } from "./lava-icon-button";

import "./vent-key.scss";

export function VentKey() {
  const [displayKey, setDisplayKey] = useState(false);

  return (
    <div className="vent-key-container">
      {!displayKey && (
        <LavaIconButton
          className="show-vent-key-button"
          label="Key"
          onClick={() => setDisplayKey(true)}
          width={27}
        >
          <VentKeyIcon />
        </LavaIconButton>
      )}

      {displayKey && (
        <>
          <button
            aria-label="Close Key"
            className="close-button"
            onClick={() => setDisplayKey(false)}
          >
            <CloseIcon />
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
