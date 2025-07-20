import { Application } from "@hotwired/stimulus";

window.Stimulus = Application.start();

import CalcController from "./controllers/calc_controller.js";
Stimulus.register("calculator", CalcController);
