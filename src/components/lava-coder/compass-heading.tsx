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
    viewer?.camera?.changed.addEventListener(handleCameraChange);
    return () => {
      viewer?.camera?.changed.removeEventListener(handleCameraChange);
    };
  }, [viewer]);

  const compassStyle: React.CSSProperties = {
    transform: `rotate(-${viewer?.camera?.heading || 0}rad)`
  };

  return (
    <CompassHeadingIcon className="compass-heading-icon" style={compassStyle} />
  );
}
