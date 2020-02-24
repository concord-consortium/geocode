import { observable } from "mobx";
import { IInterpreterController, makeInterpreterController } from "./interpreter";
import { IStore } from "../stores/stores";

interface Workspace {highlightBlock: (id: string|null) => void; }

export class BlocklyController {

  @observable
  public running = false;
  public code = "";

  private stores: IStore;
  private interpreterController?: IInterpreterController;
  private workspace: Workspace;
  private steppingThroughBlock: boolean = false;

  public constructor(stores: IStore) {
    this.stores = stores;
  }

  public setCode = (code: string, workspace: Workspace) => {
    this.code = code;

    if (this.interpreterController) {
      this.interpreterController.stop();
      workspace.highlightBlock(null);
    }
    this.running = false;
    this.workspace = workspace;
    this.interpreterController = makeInterpreterController(code, this, this.stores.simulation, workspace);

    this.stores.simulation.setBlocklyCode(code, workspace);
  }

  public run = () => {
    const reset = () => {
      this.setCode(this.code, this.workspace);
    };
    if (this.interpreterController) {
      this.interpreterController.run(reset);
      this.running = true;
    }
  }

  public reset = () => {
    this.setCode(this.code, this.workspace);
    this.stores.simulation.reset();
  }

  public stop = () => {
    if (this.interpreterController) {
      this.interpreterController.stop();
      this.running = false;
    }
  }

  // pauses the interpreter run without setting self.running = false
  public pause = () => {
    if (this.interpreterController) {
      this.interpreterController.pause();
    }
  }

  // only restarts if self.running = true. If user hit stop between `pause` and this
  // function, this won't restart the run.
  public unpause = () => {
    if (this.interpreterController && this.running) {
      const reset = () => {
        this.setCode(this.code, this.workspace);
      };
      this.interpreterController.run(reset);
    }
  }

  /**
   * Steps through one complete block.
   * This sets steppingThroughBlock to true, and then repeatedly calls `step` on the interpreter
   * until steppingThroughBlock is false. All blocks are wrapped with code that will call endStep
   * at the end of the block's function, which will set steppingThroughBlock to false.
   */
  public step = () => {
    this.steppingThroughBlock = true;

    // guard against infinite loops or a block failing to call endStep
    const maxInvocations = 100;
    let invocations = 0;

    const stepAsync = () => {
      if (this.interpreterController) {
        this.interpreterController.step();
      }
      if (this.steppingThroughBlock && invocations++ < maxInvocations) {
        setTimeout(stepAsync, 0); // async to allow endStep to be called
      }
    };
    stepAsync();
  }

  // called by interpreted block code
  public startStep = () => {
    // anything we need to do at start of step (previously we turned off
    // animation before moving to next block)
  }

  // called by interpreted block code
  public endStep = () => {
    this.steppingThroughBlock = false;
  }
}
