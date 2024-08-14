import { updateIcon } from "./update-icon.js";
import {
  getLimitAndTabCount,
  setTabLimit,
  getOpenTabsCount,
  onTabLimitChanged,
} from "./shared.js";

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(details.reason);
  if (details.reason === "install") {
    // get the number of tabs the user has open in the current window
    const openTabs = await getOpenTabsCount();
    // initialize the max tabs value in localstorage as current + 5
    await setTabLimit(openTabs + 5);
    await updateIcon(openTabs, openTabs + 5);
    // Introduce the ui, and enable user to edit the default
    await chrome.action.openPopup();
  } else if (details.reason === "update") {
    const [max, open] = await getLimitAndTabCount();
    updateIcon(open, max);
  }
});

chrome.tabs.onCreated.addListener(limitTabs);

async function limitTabs(tab: chrome.tabs.Tab) {
  const [max, open] = await getLimitAndTabCount();
  updateIcon(open, max);
  if ("id" in tab && open > max && tab.status === "loading") {
    try {
      await chrome.tabs.remove(tab.id);
    } catch (error) {
      console.error(error);
    }
  }
}

chrome.tabs.onRemoved.addListener(async () => {
  const [max, open] = await getLimitAndTabCount();
  await updateIcon(open, max);
});

onTabLimitChanged(async (change) => {
  const open = await getOpenTabsCount();
  await updateIcon(open, change.newValue);
});
