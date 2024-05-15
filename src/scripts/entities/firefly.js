import env from "../env.js";
import Calc from "../utils/calc";
import Ease from "../utils/ease";

import * as THREE from "three";

class Firefly {
  constructor(game, origin) {
    this.env = env;
    this.origin = origin;
    this.calc = new Calc();
    this.ease = new Ease();
    this.game = game;

    this.hue = 60;
    this.pulseRate = this.calc.rand(0.001, 0.005);
    this.pulseOffset = this.calc.rand(100);

    this.velocityBase = 0.005;
    this.range = 0.4;
    this.angle = this.calc.rand(Math.PI * 2);

    this.dead = false;
    this.collecting = false;

    this.observe();
    this.setupMesh();
    this.setupGlow();
  }

  observe() {
    this.env.eventful.on("game-update", (e) => this.update(e));
  }

  setupMesh() {
    this.mesh = new THREE.Mesh(
      this.game.fireflyGeometry,
      this.game.fireflyMaterial
    );
    this.mesh.position.copy(this.origin);
    this.mesh.bbox = new THREE.Box3();
    this.game.world.scene.add(this.mesh);
  }

  setupGlow() {
    this.glowMesh = new THREE.Sprite(this.game.fireflyGlowMaterial);
    this.glowScale = 0;
    this.glowMesh.scale.set(this.glowScale, this.glowScale, this.glowScale);
    this.glowMesh.position.set(0, 0, 0);
    this.mesh.add(this.glowMesh);
  }

  move() {
    let distHeroThreshold = 1.5;
    let distToHeroA = this.mesh.position.distanceTo(
      this.game.heroA.mesh.position
    );
    let distToHeroB = this.mesh.position.distanceTo(
      this.game.heroB.mesh.position
    );
    let refHero = this.game.heroA;
    let refDist = distToHeroA;
    if (distToHeroA > distToHeroB) {
      refHero = this.game.heroB;
      refDist = distToHeroB;
    }

    this.collecting = false;

    if (
      refDist < distHeroThreshold &&
      this.game.isPlaying &&
      refHero.hasMoved
    ) {
      let dz = this.mesh.position.z - refHero.mesh.position.z;
      let dx = this.mesh.position.x - refHero.mesh.position.x;
      this.angle = Math.atan2(dz, dx) + Math.PI;
      this.velocity = 0.1 * (distHeroThreshold - refDist);
      this.collecting = true;
    } else {
      this.velocity = this.calc.map(
        Math.sin(Date.now() * 0.0025 + this.pulseOffset),
        -1,
        1,
        this.velocityBase * 0.25,
        this.velocityBase
      );
      this.angle += this.calc.rand(-0.5, 0.5) * this.game.time.dtn;
      if (this.mesh.position.distanceTo(this.origin) > this.range) {
        let dz = this.mesh.position.z - this.origin.z;
        let dx = this.mesh.position.x - this.origin.x;
        this.angle = Math.atan2(dz, dx) + Math.PI;
      }
    }

    this.mesh.position.x +=
      Math.cos(this.angle) * this.velocity * this.game.time.dtn;
    this.mesh.position.z +=
      Math.sin(this.angle) * this.velocity * this.game.time.dtn;

    this.mesh.bbox.setFromObject(this.mesh);
  }

  pulse() {
    let mapValue = Math.sin(Date.now() * this.pulseRate + this.pulseOffset);
    if (this.collecting) {
      mapValue = Math.sin(Date.now() * this.pulseRate * 15 + this.pulseOffset);
    }
    let scale = this.calc.map(mapValue, -1, 1, 0.2, 1);
    this.glowMesh.scale.set(scale, scale, scale);
  }

  destroy() {
    this.dead = true;
    this.game.world.scene.remove(this.mesh);
    this.mesh = null;
    this.glowMesh = null;
  }

  update() {
    if (this.game.stateManager.current != "play") {
      return;
    }
    if (!this.dead) {
      this.move();
      this.pulse();
    }
  }
}

export default Firefly;
