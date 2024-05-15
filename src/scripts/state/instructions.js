import BaseState from "./base";

class InstructionsState extends BaseState {
  constructor(game, name) {
    super(game, name);
  }

  setupDOM() {
    super.setupDOM();
  }

  observe() {
    super.observe();
    this.dom.state.addEventListener("click", (e) => this.onClick(e));
  }

  onClick() {
    this.nextState();
  }

  nextState() {
    this.game.sounds.button.play();
    this.game.stateManager.set("play");
  }

  activate() {
    super.activate();
  }

  update() {
    super.update();
    if (!this.isActive) {
      return;
    }

    if (this.game.input.enter.pressedOnce) {
      this.nextState();
    }
  }
}

export default InstructionsState;
