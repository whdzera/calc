import { Controller } from "@hotwired/stimulus";

export default class CalcController extends Controller {
  static targets = ["display", "history"];

  connect() {
    this.reset();
    this.setupKeyboardListener();
  }

  disconnect() {
    if (this.keyboardListener) {
      document.removeEventListener("keydown", this.keyboardListener);
    }
  }

  setupKeyboardListener() {
    this.keyboardListener = (e) => {
      e.preventDefault();

      if (e.key >= "0" && e.key <= "9") {
        this.inputNumber({ target: { dataset: { value: e.key } } });
      } else if (["+", "-", "*", "/"].includes(e.key)) {
        this.inputOperator({ target: { dataset: { value: e.key } } });
      } else if (e.key === "." || e.key === ",") {
        this.inputDecimal();
      } else if (e.key === "Enter" || e.key === "=") {
        this.calculate();
      } else if (e.key === "Backspace") {
        this.backspace();
      } else if (e.key === "Escape" || e.key === "Delete") {
        this.clear();
      }
    };

    document.addEventListener("keydown", this.keyboardListener);
  }

  reset() {
    this.currentOperand = "0";
    this.previousOperand = "";
    this.operation = undefined;
    this.shouldResetScreen = false;
    this.updateDisplay();
  }

  clear() {
    this.reset();
    this.historyTarget.textContent = "";
  }

  backspace() {
    if (this.shouldResetScreen) {
      this.clear();
      return;
    }

    if (this.currentOperand.length > 1) {
      this.currentOperand = this.currentOperand.slice(0, -1);
    } else {
      this.currentOperand = "0";
    }
    this.updateDisplay();
  }

  inputNumber(event) {
    const number = event.target.dataset.value;

    if (this.shouldResetScreen) {
      this.currentOperand = "0";
      this.shouldResetScreen = false;
    }

    if (this.currentOperand === "0" && number !== "0") {
      this.currentOperand = number;
    } else if (this.currentOperand !== "0") {
      this.currentOperand += number;
    }

    this.updateDisplay();
  }

  inputDecimal() {
    if (this.shouldResetScreen) {
      this.currentOperand = "0";
      this.shouldResetScreen = false;
    }

    if (!this.currentOperand.includes(".")) {
      this.currentOperand += ".";
      this.updateDisplay();
    }
  }

  inputOperator(event) {
    const nextOperation = event.target.dataset.value;

    if (this.previousOperand === "") {
      this.previousOperand = this.currentOperand;
    } else if (!this.shouldResetScreen) {
      const result = this.performCalculation();
      this.currentOperand = `${result}`;
      this.previousOperand = this.currentOperand;
    }

    this.shouldResetScreen = true;
    this.operation = nextOperation;
    this.updateHistory();
  }

  calculate() {
    if (
      this.operation &&
      this.previousOperand !== "" &&
      !this.shouldResetScreen
    ) {
      const result = this.performCalculation();
      this.currentOperand = `${result}`;
      this.updateHistory(
        `${this.previousOperand} ${this.getOperatorSymbol(this.operation)} ${
          this.currentOperand
        } =`
      );
      this.previousOperand = "";
      this.operation = undefined;
      this.shouldResetScreen = true;
      this.updateDisplay();
    }
  }

  performCalculation() {
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return current;

    let result;
    switch (this.operation) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "*":
        result = prev * current;
        break;
      case "/":
        if (current === 0) {
          alert("Tidak bisa dibagi dengan nol!");
          return current;
        }
        result = prev / current;
        break;
      default:
        return current;
    }

    // Format hasil untuk menghindari floating point errors
    return Math.round((result + Number.EPSILON) * 100000000) / 100000000;
  }

  getOperatorSymbol(operator) {
    const symbols = {
      "+": "+",
      "-": "−",
      "*": "×",
      "/": "÷",
    };
    return symbols[operator] || operator;
  }

  updateDisplay() {
    // Format angka dengan pemisah ribuan
    const formatted = this.formatNumber(this.currentOperand);
    this.displayTarget.textContent = formatted;
  }

  updateHistory(text) {
    if (text) {
      this.historyTarget.textContent = text;
    } else if (this.operation && this.previousOperand !== "") {
      this.historyTarget.textContent = `${this.formatNumber(
        this.previousOperand
      )} ${this.getOperatorSymbol(this.operation)}`;
    }
  }

  formatNumber(numberString) {
    if (numberString === "") return "";

    const number = parseFloat(numberString);
    if (isNaN(number)) return numberString;

    // Jika angka terlalu besar atau terlalu kecil, gunakan notasi ilmiah
    if (Math.abs(number) >= 1e10 || (Math.abs(number) < 1e-6 && number !== 0)) {
      return number.toExponential(6);
    }

    // Format dengan pemisah ribuan untuk angka bulat
    if (Number.isInteger(number)) {
      return number.toLocaleString("id-ID");
    }

    // Format desimal dengan maksimal 8 digit di belakang koma
    return parseFloat(number.toFixed(8)).toLocaleString("id-ID");
  }
}
