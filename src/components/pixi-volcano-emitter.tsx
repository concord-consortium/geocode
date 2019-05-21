import { PixiComponent } from "@inlet/react-pixi";
import particles = require("pixi-particles");
import { EmitterConfig } from "pixi-particles";

const dummyConfig = {
  lifetime: {
    min: 0,
    max: 0
  },
  frequency: 0,
  pos: {
    x: 0,
    y: 0
  }
};

interface IProps {
  config: EmitterConfig;
  imagePath: string;
  x: number;
  y: number;
  playing: boolean;
  windDirection?: number;
  windSpeed?: number;
  mass?: number;
  delayMS?: number;
}

export default PixiComponent<IProps, PIXI.Container>("VolcanoEmitter", {
  create() {
    return new PIXI.Container();
  },
  applyProps(instance: PIXI.Container, _, props: IProps) {
    if (!this.emitter) {
      this.emitter = new particles.Emitter(
        instance, null, dummyConfig
      );
    }

    // if we're just turning off an existing animation, keep the current emitter and set it
    // to not emit, so we get particle die-off instead of clearing it completely.
    if (this.emitter.emit && !props.playing) {
      this.emitter.emit = false;
      return;
    }

    const animationConfig = configureAnimation(props);

    animationConfig.autoUpdate = true;
    animationConfig.emit = props.playing;

    this.emitter.init(props.imagePath, animationConfig);
  },
  willUnmount() {
    if (this.emitter) {
      this.emitter.emit = false;
      cancelAnimationFrame(this.emitter.raf);
      this.emitter.destroy();
    }
  }
});

/**
 * modifies pre-configured animation to roughly match tephra calculation, given wind, mass
 * and other variables as needed. This function is fairly tightly bound to the current ash.json
 * animation. If we end up using other animations, like lava.json, we may need to define
 * other modifying functins per animation.
 */
function configureAnimation(props: IProps) {
  const windDirRads = props.windDirection ? props.windDirection / 360 * Math.PI * 2 : 0;
  const massMag = props.mass ?  Math.floor(Math.log(props.mass) / Math.LN10) : 7;

  // deep clone so we don't permenantly modify initial config
  const initialConfig = JSON.parse(JSON.stringify(props.config));

  // magic numbers that matche tephra spread given wind speed, may eventually need to calculate
  // them from scratch if we start using different scales.
  const kAccelerationScale = 30;
  const kMinFrequency = 0.005;
  const kMaxFrequency = 0.001;
  const kFrequencyScale = 0.0005;
  const kMinAlpha = 0.3;
  const kAlphaScale = 0.05;
  const kSizeScaleStart = 8;
  const kSizeScale = 0.3;
  const kSpeedScaleStart = 7;
  const kSpeedScale = 0.2;

  const animationConfig = {
    ...initialConfig,
    pos: {
      x: props.x,
      y: props.y
    },
    acceleration: {
      x: Math.sin(windDirRads) * (props.windSpeed || 0) * kAccelerationScale,
      y: -Math.cos(windDirRads) * (props.windSpeed || 0) * kAccelerationScale
    },
    frequency: Math.max(kMaxFrequency, kMinFrequency - (massMag * kFrequencyScale)),
    alpha: {
      start: initialConfig.alpha.start * Math.min(1, kMinAlpha + (massMag * kAlphaScale)),
      end: initialConfig.alpha.end * Math.min(1, kMinAlpha + (massMag * kAlphaScale))
    },
    scale: {
      start: initialConfig.scale.start * (massMag > kSizeScaleStart ? massMag * kSizeScale : 1),
      end: initialConfig.scale.end * (massMag > kSizeScaleStart ? massMag * kSizeScale : 1)
    },
    speed: {
      start: initialConfig.speed.start * (massMag > kSpeedScaleStart ? massMag * kSpeedScale : 1),
      end: initialConfig.speed.end * (massMag > kSpeedScaleStart ? massMag * kSpeedScale : 1)
    },
  };

  return animationConfig;
}
