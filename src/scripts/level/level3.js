import BaseLevel from "./base";
import Level3Data from "../data/level3.txt?raw";

class Level3 extends BaseLevel {
  constructor(game, name) {
    super(game, name);

    this.maze = Level3Data;
  }

  update() {
    super.update();
  }
}

export default Level3;
