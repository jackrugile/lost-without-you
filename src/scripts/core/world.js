import env from "../env.js";
import Ease from "../utils/ease";

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { BrightnessContrastShader } from "three/examples/jsm/shaders/BrightnessContrastShader.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class World {
  constructor(init) {
    this.env = env;

    this.game = init.game;
    this.ease = new Ease();

    this.observe();
    this.setupScene();
    this.setupLights();
    this.setupRenderer();
    this.setupCameras();
    this.setupComposer();
    this.setupGrid();

    this.brightnessValue = 0;
    this.rgbAmount = 0;

    this.cameraLiftBase = 3.25;
    this.cameraLift = 0;
    this.cameraLiftEnd = 25;
  }

  observe() {
    this.env.eventful.on("game-resize", (e) => this.onGameResize(e));
    this.env.eventful.on("game-update", () => this.onGameAnimate());
    this.env.eventful.on("collect-firefly", () => this.smallFlash());
    this.env.eventful.on("end-tick", (e) => this.endTick(e));
    this.env.eventful.on("play-reset", () => this.playReset());
  }

  smallFlash() {
    this.brightnessValue = 0.05;
    this.rgbAmount = 0.015;
  }

  endTick(e) {
    this.brightnessValue = e.prog * 0.75;
    this.rgbAmount = e.prog * 0.05;
    this.cameraLift =
      this.cameraLiftBase +
      this.ease.inOutExpo(e.prog, 0, 1, 1) * this.cameraLiftEnd;
  }

  playReset() {
    this.brightnessValue = 0;
    this.rgbAmount = 0;
    this.cameraLift = this.cameraLiftBase;

    this.cameraCurrent.set(0, 0, 0);
    this.cameraTarget.set(0, 0, 0);
    this.cameraCurrent.y += this.cameraLiftEnd;
    this.cameraTarget.y += this.cameraLiftEnd;
    this.cameraLookAtCurrent.set(0, 0, 0);
    this.cameraLookAtTarget.set(0, 0, 0);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("hsl(0, 0%, 3%)");
  }

  setupLights() {}

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      //antialias: true,
      precision: "highp",
      powerPreference: "high-performance",
    });
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.game.dom.container.appendChild(this.renderer.domElement);
  }

  setupCameras() {
    this.fov = 100;
    this.camera = new THREE.PerspectiveCamera(this.fov, 0, 0.1, 1000);
    this.camera.position.set(-5, 5, 5);
    this.cameraCurrent = new THREE.Vector3();
    this.cameraTarget = new THREE.Vector3();
    this.cameraLookAtCurrent = new THREE.Vector3();
    this.cameraLookAtTarget = new THREE.Vector3();

    // this.orbit = new OrbitControls(this.camera, this.game.dom.container);
    // this.orbit.enableDamping = true;
    // this.orbit.dampingFactor = 0.2;
    // this.orbit.enableKeys = false;
  }

  setupComposer() {
    this.composer = new EffectComposer(this.renderer);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.renderPass.renderToScreen = false;
    //this.renderPass.clear = false;
    //this.renderPass.clearDepth = true;
    this.composer.addPass(this.renderPass);

    this.brightnessPass = new ShaderPass(BrightnessContrastShader);
    this.brightnessPass.uniforms["brightness"].value = 0;
    this.brightnessPass.uniforms["contrast"].value = 0;
    this.brightnessPass.renderToScreen = false;
    this.composer.addPass(this.brightnessPass);

    this.rgbPass = new ShaderPass(RGBShiftShader);
    this.rgbPass.uniforms["amount"].value = 0;
    this.rgbPass.uniforms["angle"].value = 0;
    this.rgbPass.renderToScreen = false;
    this.composer.addPass(this.rgbPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), // resolution
      0.75, // strength
      0.5, // radius
      0.75 //threshold
    );
    this.bloomPass.renderToScreen = false;
    this.composer.addPass(this.bloomPass);

    // noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale
    this.filmPass = new FilmPass(0.15, 0.5, 2048, false);
    this.filmPass.renderToScreen = false;
    this.composer.addPass(this.filmPass);

    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.renderToScreen = true;
    this.composer.addPass(this.fxaaPass);
  }

  setupGrid() {
    this.gridHelper = new THREE.GridHelper(100, 100, 0xffffff, 0xffffff);
    this.gridHelper.material.transparent = true;
    this.gridHelper.material.opacity = 0.05;
    this.scene.add(this.gridHelper);
  }

  update() {
    if (this.orbit) {
      this.orbit.update();
    } else {
      if (this.game.activeHero && this.game.stateManager.current === "play") {
        this.cameraTarget.copy(this.game.activeHero.mesh.position);
        this.cameraTarget.y = this.cameraLift;
        this.cameraTarget.z += 0;

        this.cameraLookAtTarget.copy(this.game.activeHero.mesh.position);

        let lerpVal = 1 - Math.exp(-0.1 * this.game.time.dtn);
        this.cameraCurrent.lerp(this.cameraTarget, lerpVal);
        this.cameraLookAtCurrent.lerp(this.cameraLookAtTarget, lerpVal);

        this.camera.position.copy(this.cameraCurrent);
        this.camera.lookAt(this.cameraLookAtCurrent);
      }
    }

    if (!this.game.isEnding) {
      if (this.rgbAmount > 0) {
        this.rgbAmount -= 0.001 * this.game.time.dtn;
        if (this.rgbAmount < 0) {
          this.rgbAmount = 0;
        }
      }
    }
    this.rgbPass.uniforms["amount"].value = this.rgbAmount;
    this.rgbPass.uniforms["angle"].value -= 0.1 * this.game.time.dtn;

    if (!this.game.isEnding) {
      if (this.brightnessValue > 0) {
        this.brightnessValue -= 0.001 * this.game.time.dtn;
        if (this.brightnessValue < 0) {
          this.brightnessValue = 0;
        }
      }
    }
    this.brightnessPass.uniforms["brightness"].value = this.brightnessValue;
  }

  render() {
    if (this.game.stateManager.current != "play") {
      return;
    }
    //this.renderer.render(this.scene, this.camera);
    this.composer.render(0.00001);
    //console.log(this.renderer.info.render.calls);
  }

  onGameResize(e) {
    this.camera.aspect = e.aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(e.dpr);
    this.renderer.setSize(e.resolution.x, e.resolution.y);
    this.composer.setSize(e.resolution.x * e.dpr, e.resolution.y * e.dpr);

    this.filmPass.uniforms.sCount.value = e.resolution.y * 2;

    this.fxaaPass.material.uniforms["resolution"].value.x =
      1 / (e.resolution.x * e.dpr);
    this.fxaaPass.material.uniforms["resolution"].value.y =
      1 / (e.resolution.y * e.dpr);
  }

  onGameAnimate() {
    this.update();
    this.render();
  }
}

export default World;
