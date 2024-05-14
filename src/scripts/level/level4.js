import BaseLevel from "./base";
import Level4Data from "../data/level4.txt?raw";

class Level4 extends BaseLevel {
  constructor(game, name) {
    super(game, name);

    this.maze = Level4Data;
  }

  update() {
    super.update();
  }
}

export default Level4;
