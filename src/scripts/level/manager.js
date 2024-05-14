import env from "../env.js";
import Level1 from "./level1.js";
import Level2 from "./level2.js";
import Level3 from "./level3.js";
import Level4 from "./level4.js";

class LevelManager {
  constructor(game) {
    this.env = env;
    this.game = game;

    this.levelNames = ["level1", "level2", "level3", "level4"];

    this.levels = {
      level1: new Level1(this.game, "level1"),
      level2: new Level2(this.game, "level2"),
      level3: new Level3(this.game, "level3"),
      level4: new Level4(this.game, "level4"),
    };
  }

  set(level) {
    if (this.current) {
      this.current.destroy();
    }
    this.build(level);
  }

  build(level) {
    this.current = this.levels[level];
    this.current.build();
  }
}

export default LevelManager;
