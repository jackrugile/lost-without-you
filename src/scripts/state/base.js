import env from "../env.js";
import Utils from "../utils/utils";

class BaseState {
  constructor(game, name) {
    this.env = env;
    this.utils = new Utils();
    this.game = game;
    this.name = name;
    this.setupDOM();
    this.observe();
  }

  setupDOM() {
    this.dom = {};
    this.dom.state = document.querySelector(`.state-${this.name}`);
  }

  observe() {
    this.env.eventful.on("game-update", (e) => this.update(e));
  }

  activate() {
    this.isActive = true;
    this.game.currentState = this;
    this.dom.state.classList.add("state-active");
    this.env.eventful.trigger(`${this.name}-state-activate`);
  }

  deactivate() {
    this.isActive = false;
    this.game.clearInputs();
    this.dom.state.classList.remove("state-active");
    this.env.eventful.trigger(`${this.name}-state-deactivate`);
  }

  update() {
    if (!this.isActive) {
      return;
    }
  }
}

export default BaseState;
