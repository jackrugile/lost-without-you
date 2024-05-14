import BaseLevel from "./base";
import Level2Data from "../data/level2.txt?raw";

class Level2 extends BaseLevel {
  constructor(game, name) {
    super(game, name);

    this.maze = Level2Data;
  }

  update() {
    super.update();
  }
}

export default Level2;
