import { CesiumWidget } from "@cesium/engine";
import { useEffect, useState } from "react";
import CompassHeadingIcon from "../../assets/lava-coder/compass.svg";

interface IProps {
  viewer: CesiumWidget | null;
}

export function CompassHeading({ viewer }: IProps) {
  const [ , forceUpdate] = useState(false);

  function handleCameraChange() {
    forceUpdate(prev => !prev);
  };

  useEffect(() => {
    let changedEvent: CesiumWidget["camera"]["changed"] | undefined;
    try {
      changedEvent = viewer?.camera?.changed;
    } catch {
      // Camera access can throw during Cesium widget initialization/destruction, which ? won't protect against
    }
    changedEvent?.addEventListener(handleCameraChange);
    return () => {
      try {
        changedEvent?.removeEventListener(handleCameraChange);
      } catch {
        // Camera access can throw during Cesium widget initialization/destruction, which ? won't protect against
      }
    };
  }, [viewer]);

  let heading = 0;
  try {
    heading = viewer?.camera?.heading ?? 0;
  } catch {
    console.log(`!!! Viewer failure`, viewer);
    console.log(` !! viewer json`, JSON.parse(JSON.stringify(viewer)));
    // Camera access can throw during Cesium widget initialization/destruction, which ? won't protect against
  }

  const compassStyle: React.CSSProperties = {
    transform: `rotate(-${heading}rad)`
  };

  return (
    <CompassHeadingIcon className="compass-heading-icon" style={compassStyle} />
  );
}
