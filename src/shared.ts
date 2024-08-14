const TAB_LIMIT_KEY = "TAB_LIMIT";
const SETTINGS_KEY = "SETTINGS";

export interface ExtensionSettings {
  limitPerWindow: boolean;
  excludeGroups: boolean;
}

const DEFAULT_SETTINGS: ExtensionSettings = {
  limitPerWindow: true,
  excludeGroups: false,
};

export async function loadSettings(): Promise<ExtensionSettings> {
  const settings = await chrome.storage.local.get({
    [SETTINGS_KEY]: DEFAULT_SETTINGS,
  });
  return settings[SETTINGS_KEY];
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  if (validateSettings(settings)) {
    await chrome.storage.local.set({
      [SETTINGS_KEY]: settings,
    });
  }
}

export function isSetting(key: string): key is keyof ExtensionSettings {
  return key in DEFAULT_SETTINGS;
}

export async function getLimitAndTabCount(): Promise<
  [limit: number, open: number]
> {
  return Promise.all([getTabLimit(), getOpenTabsCount()]);
}

export async function getOpenTabsCount() {
  const settings = await loadSettings();
  const tabs = await chrome.tabs.query({
    currentWindow: settings.limitPerWindow,
  });
  return tabs.length;
}

export async function setTabLimit(max: number): Promise<void> {
  await chrome.storage.local.set({ [TAB_LIMIT_KEY]: Math.max(1, max) });
}

export async function getTabLimit(): Promise<number> {
  const data = await chrome.storage.local.get([TAB_LIMIT_KEY]);
  return data[TAB_LIMIT_KEY];
}

type TabLimitChange = { oldValue?: number; newValue: number };

export function onTabLimitChanged(callback: (change: TabLimitChange) => void) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!(TAB_LIMIT_KEY in changes)) return;
    const change = changes[TAB_LIMIT_KEY];
    if (isStorageChange(change, isNumber)) {
      callback(change);
    }
  });
}

type SettingsChange = {
  oldValue?: ExtensionSettings;
  newValue: ExtensionSettings;
};

export function onSettingsChanged(callback: (change: SettingsChange) => void) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!(SETTINGS_KEY in changes)) return;
    const change = changes[SETTINGS_KEY];
    if (isStorageChange(change, validateSettings)) {
      callback(change);
    }
  });
}

function validateSettings(input: unknown): input is ExtensionSettings {
  if (!isObject(input)) return false;
  const limitPerWindow =
    hasProp(input, "limitPerWindow") && isBoolean(input.limitPerWindow);
  const excludeGroups =
    hasProp(input, "excludeGroups") && isBoolean(input.excludeGroups);
  return limitPerWindow && excludeGroups;
}

type StorageChange<T> = {
  oldValue?: T;
  newValue: T;
};

function isStorageChange<T>(
  input: unknown,
  check: (value: unknown) => value is T
): input is StorageChange<T> {
  if (!isObject(input)) return false;
  const hasNewValue = "newValue" in input && check(input.newValue);
  if ("oldValue" in input) {
    return hasNewValue && check(input.oldValue);
  }
  return hasNewValue;
}

function isObject(input: unknown): input is NonNullable<object> {
  return input !== null && typeof input === "object";
}

function hasProp<K extends string>(
  obj: object,
  key: K
): obj is Record<K, unknown> {
  return key in obj;
}

function isBoolean(input: unknown): input is boolean {
  return typeof input === "boolean";
}

function isNumber(input: unknown): input is number {
  return typeof input === "number" && !isNaN(input) && isFinite(input);
}
