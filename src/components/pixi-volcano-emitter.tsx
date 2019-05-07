import { PixiComponent } from "@inlet/react-pixi";
import particles = require("pixi-particles");
import { EmitterConfig } from "pixi-particles";

interface IProps {
  config: EmitterConfig;
  imagePath: string;
  x: number;
  y: number;
  windDirection?: number;
  windSpeed?: number;
  delayMS?: number;
}

export default PixiComponent<IProps, PIXI.particles.ParticleContainer>("VolcanoEmitter", {
  create() {
    return new PIXI.particles.ParticleContainer();
  },
  applyProps(instance: PIXI.particles.ParticleContainer, _, props: IProps) {
    const windDirRads = props.windDirection ? props.windDirection / 360 * Math.PI * 2 : 0;
    const emitterConfig = {
      ...props.config,
      pos: {
        x: props.x,
        y: props.y
      },
      acceleration: {
        x: Math.sin(windDirRads) * (props.windSpeed || 0),
        y: -Math.cos(windDirRads) * (props.windSpeed || 0)
      }
    };
    if (this._emitter) {
      this._emitter.destroy();
    }
    this._emitter = new particles.Emitter(
      instance,
      [PIXI.Texture.fromImage(props.imagePath)],
      emitterConfig
    );

    let elapsed = Date.now();

    const update = () => {
      this._emitter.raf = requestAnimationFrame(update);
      const now = Date.now();

      this._emitter.update((now - elapsed) * 0.001);

      elapsed = now;
    };

    this._emitter.emit = true;
    if (props.delayMS) {
      setTimeout(update, props.delayMS);
    } else {
      update();
    }
  },
  willUnmount() {
    if (this._emitter) {
      this._emitter.emit = false;
      cancelAnimationFrame(this._emitter.raf);
    }
  }
});
