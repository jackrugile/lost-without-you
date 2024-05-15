import env from "../env.js";

import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { BrightnessContrastShader } from "three/examples/jsm/shaders/BrightnessContrastShader.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";

// require("three/examples/js/controls/OrbitControls.js");
// require("three/examples/js/postprocessing/MaskPass");
// require("three/examples/js/shaders/CopyShader");
// require("three/examples/js/shaders/FilmShader.js");
// require("three/examples/js/shaders/ConvolutionShader");
// require("three/examples/js/shaders/LuminosityHighPassShader");

class World {
  constructor(init) {
    this.env = env;

    this.game = init.game;

    this.observe();
    this.setupScene();
    this.setupLights();
    this.setupRenderer();
    this.setupCameras();
    this.setupComposer();
    this.setupGrid();

    this.cameraLift = 0;
  }

  observe() {
    this.env.eventful.on("game-resize", (e) => this.onGameResize(e));
    this.env.eventful.on("game-update", () => this.onGameAnimate());
    this.env.eventful.on("collect-firefly", () => this.smallFlash());
    this.env.eventful.on("end-tick", (e) => this.endTick(e));
    this.env.eventful.on("play-reset", () => this.playReset());
  }

  smallFlash() {
    this.brightnessValue = 0.03;
  }

  endTick(e) {
    this.brightnessValue = e.prog * 0.75;
    this.cameraLift = 3 + e.prog * 100;
  }

  playReset() {
    this.brightnessValue = 0;
    this.cameraLift = 3;

    // this.cameraCurrent.copy(this.game.activeHero.mesh.position);
    // this.cameraTarget.copy(this.game.activeHero.mesh.position);
    // this.cameraCurrent.y += 100;
    // this.cameraTarget.y += 100;
    // this.cameraLookAtCurrent.copy(this.game.activeHero.mesh.position);
    // this.cameraLookAtTarget.copy(this.game.activeHero.mesh.position);

    this.cameraCurrent.set(0, 0, 0);
    this.cameraTarget.set(0, 0, 0);
    this.cameraCurrent.y += 100;
    this.cameraTarget.y += 100;
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

    // this.orbit = new THREE.OrbitControls(this.camera, this.game.dom.container);
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
    this.brightnessValue = 0;
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
    this.filmPass.renderToScreen = true;
    this.composer.addPass(this.filmPass);
  }

  setupGrid() {
    // this.gridHelper = new THREE.GridHelper(100, 100, 0xffffff, 0x666666);
    // this.gridHelper.material.transparent = true;
    // this.gridHelper.material.opacity = 0.2;
    // this.scene.add(this.gridHelper);
  }

  update() {
    //this.orbit.update();
    if (this.game.activeHero && this.game.stateManager.current === "play") {
      this.cameraTarget.copy(this.game.activeHero.mesh.position);
      //this.cameraTarget.y = 3;
      this.cameraTarget.y = this.cameraLift;
      this.cameraTarget.z += 0;

      this.cameraLookAtTarget.copy(this.game.activeHero.mesh.position);

      let lerpVal = 1 - Math.exp(-0.15 * this.game.time.dtn);
      this.cameraCurrent.lerp(this.cameraTarget, lerpVal);
      this.cameraLookAtCurrent.lerp(this.cameraLookAtTarget, lerpVal);

      this.camera.position.copy(this.cameraCurrent);
      this.camera.lookAt(this.cameraLookAtCurrent);
    }

    this.rgbPass.uniforms["amount"].value =
      0.0008 + Math.sin(Date.now() * 0.003) * 0.0008;
    this.rgbPass.uniforms["angle"].value -= 0.1 * this.game.time.dtn;
    //this.bloomPass.strength = 0.5 + Math.sin(Date.now() * 0.003) * 0.5;
    //this.bloomPass.radius = 1 + Math.sin(Date.now() * 0.003) * 1;
    //this.bloomPass.radius = 0.5 - Math.sin(Date.now() * 0.003) * 0.25;

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
  }

  onGameAnimate() {
    this.update();
    this.render();
  }
}

export default World;
