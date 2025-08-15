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
              <div className="description-line">Hazard Zones</div>
            </div>
            <div className="item-grid">
              <div className="item-box very-likely" />
              <div className="item-label very-likely">Extremely High Hazard</div>
              <div className="item-box likely" />
              <div className="item-label likely">Very High Hazard</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
