import BaseLevel from "./base";
import Level1Data from "../data/level1.txt?raw";

class Level1 extends BaseLevel {
  constructor(game, name) {
    super(game, name);

    this.maze = Level1Data;
  }

  update() {
    super.update();
  }
}

export default Level1;
