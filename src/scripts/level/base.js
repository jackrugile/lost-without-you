import env from "../env.js";
import Calc from "../utils/calc";
import Firefly from "../entities/firefly";
import Hero from "../entities/hero";

import * as THREE from "three";
import { trim } from "lodash-es";

class BaseLevel {
  constructor(game, name) {
    this.env = env;
    this.calc = new Calc();
    this.game = game;
    this.name = name;
    this.observe();
  }

  observe() {
    this.env.eventful.on("game-update", (e) => this.update(e));
  }

  build() {
    this.parseMaze();
    this.setupLights();
    this.setupGround();
    this.setupWalls();
    this.setupHeros();
    this.setupFireflies();
  }

  parseMaze() {
    this.mazeTrimmed = trim(this.maze);
    this.mazeLines = this.mazeTrimmed.split("\n");
    this.mazeArray = [];
    this.mazeLines.forEach((line) => {
      this.mazeArray.push(trim(line).split(" "));
    });
    this.mazeArray.forEach((line) => {
      line.forEach((item, i, arr) => {
        arr[i] = parseInt(item, 10);
      });
    });
    this.mazeRows = this.mazeArray[0].length;
    this.mazeCols = this.mazeArray.length;
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(0x111111);
    this.game.world.scene.add(this.ambientLight);
  }

  setupGround() {
    this.groundGeometry = new THREE.PlaneBufferGeometry(
      this.mazeRows,
      this.mazeCols
    );
    this.groundGeometry.applyMatrix(
      new THREE.Matrix4().makeRotationX(-Math.PI / 2)
    );
    this.groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      specular: 0x333333,
      shininess: 30,
    });
    this.groundMesh = new THREE.Mesh(this.groundGeometry, this.groundMaterial);
    this.groundMesh.castShadow = false;
    this.groundMesh.receiveShadow = true;
    this.groundMesh.position.set(0, 0, 0);
    this.game.world.scene.add(this.groundMesh);
  }

  setupWalls() {
    this.walls = [];
    this.walls2 = [];
    this.mazeArray.forEach((line, i) => {
      let currWall = {};
      let hasWall = false;
      line.forEach((item, j) => {
        if (item === 3) {
          if (hasWall) {
            currWall.width++;
            currWall.x += 0.5;
          } else {
            currWall = {
              x: j - this.mazeCols / 2,
              z: i - this.mazeRows / 2,
              width: 1,
              height: 1,
              depth: 1,
            };
            hasWall = true;
            this.walls2.push(currWall);
          }
        } else {
          hasWall = false;
        }
      });
    });

    // this reverts back to single cubes for testing heights
    // this.mazeArray.forEach((line, i) => {
    //   let currWall = {};
    //   let hasWall = false;
    //   line.forEach((item, j) => {
    //     if(item === 3) {
    //       if(hasWall) {
    //         currWall.width++;
    //         currWall.x += 0.5;
    //       } else {
    //         currWall = {
    //           x: j - this.mazeCols / 2,
    //           z: i - this.mazeRows / 2,
    //           width: 1,
    //           height: this.calc.rand(0.5, 1),
    //           depth: 1
    //         };
    //         //hasWall = true;
    //         this.walls2.push(currWall);
    //       }
    //     } else {
    //       hasWall = false;
    //     }
    //   });
    // });

    this.walls2.forEach((wall) => {
      let mesh = new THREE.Mesh(
        new THREE.BoxBufferGeometry(wall.width, wall.height, wall.depth),
        this.game.wallMaterial
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(wall.x + 0.5, wall.height / 2, wall.z + 0.5);
      mesh.bbox = new THREE.Box3();
      mesh.bbox.setFromObject(mesh);
      this.walls.push(mesh);
      this.game.world.scene.add(mesh);
    });

    // this.walls2.forEach((wall) => {
    //   let mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(wall.width, 1, 1), this.game.wallMaterial);
    //   //mesh.castShadow = true;
    //   //mesh.receiveShadow = true;
    //   mesh.position.set(wall.x + 0.5, 0.5, wall.z + 0.5);
    //   mesh.bbox = new THREE.Box3();
    //   mesh.bbox.setFromObject(mesh);
    //   this.walls.push(mesh);
    //   //this.game.world.scene.add(mesh);
    // });

    // let comboGeo = new THREE.Geometry();

    // this.walls2.forEach((wall) => {
    //   let newGeo = new THREE.BoxGeometry(wall.width, 1, 1);
    //   newGeo.translate(wall.x + 0.5, 0.5, wall.z + 0.5);
    //   comboGeo.merge(newGeo);
    // });

    // let mesh = new THREE.Mesh(comboGeo, this.game.wallMaterial);
    // mesh.castShadow = true;
    // mesh.receiveShadow = true;
    // this.game.world.scene.add(mesh);
  }

  setupHeros() {
    this.mazeArray.forEach((line, i) => {
      line.forEach((item, j) => {
        if (item === 1 || item === 2) {
          let x = j - this.mazeCols / 2;
          let y = 0;
          let z = i - this.mazeRows / 2;
          let origin = new THREE.Vector3(x + 0.5, y, z + 0.5);
          if (item === 1) {
            this.game.heroA = new Hero(this.game, "a", origin);
          }
          if (item === 2) {
            this.game.heroB = new Hero(this.game, "b", origin);
          }
        }
      });
    });
  }

  setupFireflies() {
    this.mazeArray.forEach((line, i) => {
      line.forEach((item, j) => {
        let off = i % 6 === 0 ? 1 : 0;
        if (item === 0 && i % 3 === 0 && (j + off) % 3 === 0) {
          let x = j - this.mazeCols / 2 + 0.5;
          let y = 0.29;
          let z = i - this.mazeRows / 2 + 0.5;
          this.game.fireflies.push(
            new Firefly(this.game, new THREE.Vector3(x, y, z))
          );
        }
      });
    });
  }

  destroy() {
    let i = this.game.fireflies.length;
    while (i--) {
      let firefly = this.game.fireflies[i];
      firefly.destroy();
    }
    this.game.fireflies.length = 0;

    this.game.heroA.destroy();
    this.game.heroB.destroy();
    this.game.heroA = null;
    this.game.heroB = null;
    this.game.activeHero = null;

    this.game.world.scene.remove(this.ambientLight);
    this.ambientLight = null;

    this.game.world.scene.remove(this.groundMesh);
    this.groundGeometry.dispose();
    this.groundMaterial.dispose();
    this.groundMesh = null;

    this.mazeTrimmed = null;
    this.mazeLines = null;
    this.mazeArray = null;
    this.mazeRows = null;
    this.mazeCols = null;

    let j = this.walls.length;
    while (j--) {
      let wall = this.walls[j];
      this.game.world.scene.remove(wall);
      wall.geometry.dispose();
      wall = null;
    }
    this.walls.length = 0;
  }

  update() {}
}

export default BaseLevel;
