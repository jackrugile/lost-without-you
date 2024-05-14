import Eventful from "./utils/eventful";
import StorageManager from "./utils/storage";

export default {
  eventful: new Eventful(),
  storage: new StorageManager("lost-without-you"),
};
