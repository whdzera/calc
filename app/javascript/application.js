import { Application } from "@hotwired/stimulus";

window.Stimulus = Application.start();

import ThemeController from "./controllers/theme_controller.js";
Stimulus.register("theme", ThemeController);
import CalcController from "./controllers/calc_controller.js";
Stimulus.register("calculator", CalcController);
