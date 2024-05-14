import env from "../env.js";

class Keys {
  constructor(game) {
    this.env = env;
    this.game = game;

    this.keyWatch = {
      up: [87, 38], // w, up
      down: [83, 40], // s, down
      left: [65, 37], // a, left
      right: [68, 39], // d, right
    };

    this.observe();
  }

  observe() {
    window.addEventListener("keydown", (e) => this.onKeydown(e));
    window.addEventListener("keyup", (e) => this.onKeyup(e));
  }

  onKeydown(e) {
    let key = e.which;
    if (this.keyWatch.up.indexOf(key) > -1) {
      this.env.eventful.trigger("key-pressed", { input: "up" });
    }
    if (this.keyWatch.down.indexOf(key) > -1) {
      this.env.eventful.trigger("key-pressed", { input: "down" });
    }
    if (this.keyWatch.left.indexOf(key) > -1) {
      this.env.eventful.trigger("key-pressed", { input: "left" });
    }
    if (this.keyWatch.right.indexOf(key) > -1) {
      this.env.eventful.trigger("key-pressed", { input: "right" });
    }
  }

  onKeyup(e) {
    let key = e.which;
    if (this.keyWatch.up.indexOf(key) > -1) {
      this.env.eventful.trigger("key-released", { input: "up" });
    }
    if (this.keyWatch.down.indexOf(key) > -1) {
      this.env.eventful.trigger("key-released", { input: "down" });
    }
    if (this.keyWatch.left.indexOf(key) > -1) {
      this.env.eventful.trigger("key-released", { input: "left" });
    }
    if (this.keyWatch.right.indexOf(key) > -1) {
      this.env.eventful.trigger("key-released", { input: "right" });
    }
  }
}

export default Keys;
