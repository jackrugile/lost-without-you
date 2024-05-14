import env from "../env.js";

class Gamepad {
  constructor(game) {
    this.env = env;
    this.game = game;
    this.gamepad = null;
    this.index = null;

    this.DPADTOP = 12;
    this.DPADDOWN = 13;
    this.DPADLEFT = 14;
    this.DPADRIGHT = 15;
    this.buttons = {};

    this.observe();
  }

  observe() {
    window.addEventListener("gamepadconnected", (e) =>
      this.onGamepadConnected(e)
    );
    this.env.eventful.on("game-update", () => this.onGameUpdate());
  }

  onGamepadConnected(e) {
    this.gamepad = navigator.getGamepads()[e.gamepad.index];
    this.index = e.gamepad.index;
  }

  onGameUpdate() {
    let gamepads = navigator.getGamepads
      ? navigator.getGamepads()
      : navigator.webkitGetGamepads
      ? navigator.webkitGetGamepads
      : [];
    if (!this.gamepad || !gamepads) {
      return;
    }

    let gp = gamepads[this.index];

    if (gp.buttons[this.DPADTOP].pressed && !this.buttons[this.DPADTOP]) {
      this.buttons[this.DPADTOP] = true;
      this.env.eventful.trigger("gamepad-button-pressed", { input: "up" });
    }
    if (gp.buttons[this.DPADDOWN].pressed && !this.buttons[this.DPADDOWN]) {
      this.buttons[this.DPADDOWN] = true;
      this.env.eventful.trigger("gamepad-button-pressed", { input: "down" });
    }
    if (gp.buttons[this.DPADLEFT].pressed && !this.buttons[this.DPADLEFT]) {
      this.buttons[this.DPADLEFT] = true;
      this.env.eventful.trigger("gamepad-button-pressed", { input: "left" });
    }
    if (gp.buttons[this.DPADRIGHT].pressed && !this.buttons[this.DPADRIGHT]) {
      this.buttons[this.DPADRIGHT] = true;
      this.env.eventful.trigger("gamepad-button-pressed", { input: "right" });
    }

    if (!gp.buttons[this.DPADTOP].pressed && this.buttons[this.DPADTOP]) {
      this.buttons[this.DPADTOP] = false;
      this.env.eventful.trigger("gamepad-button-released", { input: "up" });
    }
    if (!gp.buttons[this.DPADDOWN].pressed && this.buttons[this.DPADDOWN]) {
      this.buttons[this.DPADDOWN] = false;
      this.env.eventful.trigger("gamepad-button-released", { input: "down" });
    }
    if (!gp.buttons[this.DPADLEFT].pressed && this.buttons[this.DPADLEFT]) {
      this.buttons[this.DPADLEFT] = false;
      this.env.eventful.trigger("gamepad-button-released", { input: "left" });
    }
    if (!gp.buttons[this.DPADRIGHT].pressed && this.buttons[this.DPADRIGHT]) {
      this.buttons[this.DPADRIGHT] = false;
      this.env.eventful.trigger("gamepad-button-released", { input: "right" });
    }
  }
}

export default Gamepad;
