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

    this.emitter.emit = props.playing;

    this.emitter.init(props.imagePath, props.config);
  },
  willUnmount() {
    if (this.emitter) {
      this.emitter.emit = false;
      cancelAnimationFrame(this.emitter.raf);
      this.emitter.destroy();
    }
  }
});
