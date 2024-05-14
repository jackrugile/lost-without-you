import env from "../env.js";
import InstructionsState from "./instructions.js";
import LoseState from "./lose.js";
import MenuState from "./menu.js";
import PlayState from "./play.js";
import WinState from "./win.js";

class StateManager {
  constructor(game) {
    this.env = env;
    this.game = game;
    this.states = {
      instructions: new InstructionsState(this.game, "instructions"),
      lose: new LoseState(this.game, "lose"),
      menu: new MenuState(this.game, "menu"),
      play: new PlayState(this.game, "play"),
      win: new WinState(this.game, "win"),
    };
  }

  set(state) {
    if (this.current) {
      this.states[this.current].deactivate();
    }
    this.current = state;
    this.states[this.current].activate();
  }
}

export default StateManager;
