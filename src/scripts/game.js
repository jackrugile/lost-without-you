import env from "./env.js";
import Calc from "./utils/calc";
import Ease from "./utils/ease";
import Gamepad from "./input/gamepad";
import Keys from "./input/keys";
import Time from "./core/time";
import World from "./core/world";
import StateManager from "./state/manager";
import LevelManager from "./level/manager";

import * as THREE from "three";
import { Howl, Howler } from "howler";

class Game {
  constructor() {
    this.build();
  }

  build() {
    this.env = env;
    this.calc = new Calc();
    this.ease = new Ease();

    this.debug = location.hash.indexOf("debug") > -1;
    this.resolution = {};

    this.setupDOM();
    this.setupStorage();
    this.setupTime();
    this.setupWorld();
    this.setupStates();
    this.setupFireflies();
    this.setupLevels();
    this.setupInputs();
    this.setupSounds();
    this.onResize();
    this.start();
    this.observe();
  }

  setupDOM() {
    this.dom = {};
    this.dom.container = document.querySelector(".container");
    this.dom.scaler = document.querySelector(".scaler");
  }

  setupStorage() {
    if (!this.env.storage.get("level1")) {
      this.env.storage.set("level1", {
        name: "level1",
        index: 0,
        available: true,
        beaten: false,
        bestTime: null,
        timesPlayed: 0,
      });
    }

    if (!this.env.storage.get("level2")) {
      this.env.storage.set("level2", {
        name: "level2",
        index: 1,
        available: false,
        beaten: false,
        bestTime: null,
        timesPlayed: 0,
      });
    }

    if (!this.env.storage.get("level3")) {
      this.env.storage.set("level3", {
        name: "level3",
        index: 2,
        available: false,
        beaten: false,
        bestTime: null,
        timesPlayed: 0,
      });
    }

    if (!this.env.storage.get("level4")) {
      this.env.storage.set("level4", {
        name: "level4",
        index: 3,
        available: false,
        beaten: false,
        bestTime: null,
        timesPlayed: 0,
      });
    }
  }

  setupTime() {
    this.time = new Time();
  }

  setupWorld() {
    this.world = new World({ game: this });
  }

  setupStates() {
    this.stateManager = new StateManager(this);
    //this.stateManager.set('play');
    this.stateManager.set("menu");
  }

  setupFireflies() {
    // this.fireflyGeometry = new THREE.SphereBufferGeometry(0.01, 0.01, 72, 72);
    this.fireflyGeometry = new THREE.SphereGeometry(0.01, 0.01, 72, 72);
    this.fireflyMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let size = 512;
    canvas.width = size;
    canvas.height = size;
    let glow_gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    let steps = 20;
    for (let i = 0; i < steps; i++) {
      let p = i / (steps - 1);
      let a = this.calc.map(this.ease.outExpo(p, 0, 1, 1), 0, 1, 1, 0);
      glow_gradient.addColorStop(p, `hsla(60, 100%, 40%, ${a})`);
    }
    ctx.fillStyle = glow_gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    this.fireflyGlowMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    this.fireflies = [];
  }

  setupLevels() {
    // this.wallGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    this.wallGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.wallMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      specular: 0x666666,
      shininess: 20,
    });

    this.levelManager = new LevelManager(this);
  }

  setupInputs() {
    this.gamepad = new Gamepad();
    this.keys = new Keys();

    this.input = {
      up: {
        pressed: false,
        pressedOnce: false,
      },
      down: {
        pressed: false,
        pressedOnce: false,
      },
      left: {
        pressed: false,
        pressedOnce: false,
      },
      right: {
        pressed: false,
        pressedOnce: false,
      },
    };
  }

  setupSounds() {
    this.sounds = {
      fireflyCollect: new Howl({
        src: ["src/assets/sounds/firefly-collect.mp3"],
        volume: 1,
        rate: 1.5,
      }),
      button: new Howl({
        src: ["src/assets/sounds/click.mp3"],
        volume: 0.9,
        rate: 2,
      }),
      levelIntro: new Howl({
        src: ["src/assets/sounds/intro.mp3"],
        volume: 1,
      }),
      death: new Howl({
        src: ["src/assets/sounds/death.mp3"],
        volume: 0.15,
      }),
      unite: new Howl({
        src: ["src/assets/sounds/unite.mp3"],
        volume: 0.1,
      }),
      zoey: new Howl({
        src: ["src/assets/sounds/zoey.mp3"],
        volume: 1,
      }),
      mary: new Howl({
        src: ["src/assets/sounds/mary.mp3"],
        volume: 0.2,
      }),
      switch: new Howl({
        src: ["src/assets/sounds/switch.mp3"],
        volume: 0.4,
      }),
      music: new Howl({
        src: ["src/assets/sounds/music.mp3"],
        volume: 0.3,
        pool: 1,
        loop: true,
      }),
    };
  }

  playSound(sound, config = null) {
    if (!this.muted) {
      if (config && config.volume) {
        sound.volume(config.volume);
      }
      if (config && config.rate) {
        sound.rate(config.rate);
      }
      sound.play();
    }
  }

  observe() {
    window.addEventListener("resize", () => this.onResize());

    this.env.eventful.on("key-pressed", (e) => this.onInputPressed(e));
    this.env.eventful.on("key-released", (e) => this.onInputReleased(e));
    this.env.eventful.on("gamepad-button-pressed", (e) =>
      this.onInputPressed(e)
    );
    this.env.eventful.on("gamepad-button-released", (e) =>
      this.onInputReleased(e)
    );

    document.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  onResize() {
    let ratioWin = window.innerWidth / window.innerHeight;
    let ratioGame = 16 / 9;

    if (ratioWin > ratioGame) {
      this.resolution.x = window.innerHeight * ratioGame;
      this.resolution.y = window.innerHeight;
    } else {
      this.resolution.x = window.innerWidth;
      this.resolution.y = window.innerWidth / ratioGame;
    }

    this.aspect = this.resolution.x / this.resolution.y;
    //this.dpr = window.devicePixelRatio > 1 ? 2 : 1;
    this.dpr = 1;
    if (window.devicePixelRatio > 1) {
      document.body.classList.add("retina");
    } else {
      document.body.classList.remove("retina");
    }

    this.dom.container.style.width = `${this.resolution.x}px`;
    this.dom.container.style.height = `${this.resolution.y}px`;

    this.dom.scaler.style.transform = `scale(${this.resolution.y / 1080})`;

    this.domOffset = {
      x: Math.round(this.dom.container.offsetLeft),
      y: Math.round(this.dom.container.offsetTop),
    };

    this.env.eventful.trigger("game-resize", {
      resolution: this.resolution,
      aspect: this.aspect,
      dpr: this.dpr,
      domOffset: this.domOffset,
    });
  }

  onInputPressed(e) {
    if (!this.input[e.input].pressed) {
      this.input[e.input].pressedOnce = true;
      this.input[e.input].pressed = true;
    }
  }

  onInputReleased(e) {
    if (this.input[e.input].pressed) {
      this.input[e.input].pressed = false;
    }
  }

  start() {
    this.raf = this.animate();
  }

  stop() {
    window.cancelAnimationFrame(this.raf);
  }

  preUpdate() {
    this.env.eventful.trigger("game-pre-update");
  }

  update() {
    this.env.eventful.trigger("game-update");
  }

  postUpdate() {
    this.env.eventful.trigger("game-post-update");
    this.input.up.pressedOnce = false;
    this.input.down.pressedOnce = false;
    this.input.left.pressedOnce = false;
    this.input.right.pressedOnce = false;
  }

  animate() {
    this.preUpdate();
    this.update();
    this.postUpdate();
    this.raf = window.requestAnimationFrame(() => this.animate());
  }
}

export default new Game();
