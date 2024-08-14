import { loadSettings, saveSettings, isSetting } from "../shared.js";

let settings = await loadSettings();

const limitPerWindowCheckbox = document.querySelector<HTMLInputElement>(
  'input[name="limit-per-window"]'
)!;

limitPerWindowCheckbox.checked = settings.limitPerWindow;

const settingsForm = document.querySelector("form")!;

settingsForm
  .querySelectorAll("input")
  .forEach((inp) => inp.addEventListener("change", handleSettingsChange));

function handleSettingsChange(this: HTMLInputElement, _event: Event) {
  if (isSetting(this.name)) {
    if (this.name === "limitPerWindow") {
      settings[this.name] = this.checked;
    }
  }
}

let messageTimeoutId: number;

settingsForm.addEventListener("submit", async (event) => {
  try {
    event.preventDefault();
    await saveSettings(settings);
    if (messageTimeoutId) {
      document.querySelector("p")?.classList.remove("show");
      clearTimeout(messageTimeoutId);
    }
    document.querySelector("p")?.classList.add("show");
    messageTimeoutId = setTimeout(() => {
      document.querySelector("p")?.classList.remove("show");
    }, 2000);
  } catch (error) {}
});
