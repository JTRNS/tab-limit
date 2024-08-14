import { getLimitAndTabCount, setTabLimit } from "../shared.js";

const [limit, tabCount] = await getLimitAndTabCount();

const maxTabsInput = document.querySelector("input")!;
const increaseButton = document.querySelector<HTMLButtonElement>(
  "button:first-of-type"
)!;
const decreaseButton = document.querySelector<HTMLButtonElement>(
  "button:last-of-type"
)!;

let shifKeyDown = false;

document.body.addEventListener("keydown", (event) => {
  if (event.key === "Shift") {
    shifKeyDown = true;
  }
});

document.body.addEventListener("keyup", (event) => {
  if (event.key === "Shift") {
    shifKeyDown = false;
  }
});

maxTabsInput.value = limit.toString(10);
maxTabsInput.min = tabCount.toString(10);

const increase = () => {
  maxTabsInput.stepUp(shifKeyDown ? 10 : 1);
  maxTabsInput.dispatchEvent(new Event("input"));
};

const decrease = () => {
  maxTabsInput.stepDown(shifKeyDown ? 10 : 1);
  maxTabsInput.dispatchEvent(new Event("input"));
};

setupPressAndHold(increaseButton, increase);
setupPressAndHold(decreaseButton, decrease);

function setupPressAndHold(button: HTMLButtonElement, fn: () => void) {
  let timeoutId: number;
  button.addEventListener("pointerdown", () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    fn();
    let interval: number;

    timeoutId = setTimeout(() => {
      interval = setInterval(() => {
        fn();
      }, 100);
    }, 250);

    const clear = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (interval) {
        clearInterval(interval);
      }
      button.removeEventListener("pointerup", clear);
      button.removeEventListener("mouseleave", clear);
    };

    button.addEventListener("pointerup", clear);
    button.addEventListener("mouseleave", clear);
  });
}

maxTabsInput.addEventListener(
  "input",
  async (_e) => await setTabLimit(maxTabsInput.valueAsNumber)
);

function handleManualInput(this: HTMLInputElement, _event: FocusEvent) {
  let initialValue = maxTabsInput.valueAsNumber;
  this.addEventListener(
    "blur",
    () => {
      let currentValue = parseInt(maxTabsInput.value, 10);
      if (isNaN(currentValue)) {
        maxTabsInput.value = initialValue.toString(10);
        setTabLimit(initialValue);
      } else {
        setTabLimit(currentValue);
      }
    },
    { once: true }
  );
}

maxTabsInput.addEventListener("focus", handleManualInput);
