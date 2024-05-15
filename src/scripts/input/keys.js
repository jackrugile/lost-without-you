import env from "../env.js";

class Keys {
  constructor(game) {
    this.env = env;
    this.game = game;

    this.keyWatch = {
      enter: [13], // enter
      up: [87, 38], // w, up arrow
      down: [83, 40], // s, down arrow
      left: [65, 37], // a, left arrow
      right: [68, 39], // d, right arrow
    };
    this.keyWatchEntries = Object.entries(this.keyWatch);

    this.observe();
  }

  observe() {
    window.addEventListener("keydown", (e) => this.onKeydown(e));
    window.addEventListener("keyup", (e) => this.onKeyup(e));
  }

  onKeydown(e) {
    for (const [key, value] of this.keyWatchEntries) {
      if (value.indexOf(e.which) > -1) {
        this.env.eventful.trigger("key-pressed", { input: key });
      }
    }
  }

  onKeyup(e) {
    for (const [key, value] of this.keyWatchEntries) {
      if (value.indexOf(e.which) > -1) {
        this.env.eventful.trigger("key-released", { input: key });
      }
    }
  }
}

export default Keys;
