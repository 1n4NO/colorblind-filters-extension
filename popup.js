(function () {
  "use strict";

  const STORAGE_KEYS = {filter: "selectedFilter", language: "selectedLanguage"};
  const FILTER_IDS = ["off", "protanopia", "protanomaly", "deuteranopia", "deuteranomaly", "tritanopia", "tritanomaly", "achromatopsia", "achromatomaly"];
  const LANGUAGES = ["en", "es", "fr", "de", "pt_BR", "it", "hi", "ja", "ko", "zh_CN"];
  let messages = {};

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const t = (key) => messages[key]?.message || key;

  async function loadMessages(locale) {
    const response = await fetch(chrome.runtime.getURL(`_locales/${locale}/messages.json`));
    if (!response.ok) throw new Error(`Unable to load locale: ${locale}`);
    messages = await response.json();
    document.documentElement.lang = locale.replace("_", "-");
    $$('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  }

  function renderSelected(filterId) {
    $$("[data-filter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filterId));
    });
  }

  async function sendFilterToActiveTab(filterId) {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (!tab?.id) throw new Error("No active tab");

    try {
      await chrome.tabs.sendMessage(tab.id, {type: "apply-filter", filterId});
    } catch (error) {
      await chrome.scripting.executeScript({target: {tabId: tab.id}, files: ["content.js"]});
      await chrome.tabs.sendMessage(tab.id, {type: "apply-filter", filterId});
    }
  }

  async function setFilter(filterId) {
    await chrome.storage.local.set({[STORAGE_KEYS.filter]: filterId});
    renderSelected(filterId);
    try {
      await sendFilterToActiveTab(filterId);
      $(".status-message").textContent = t("applied");
    } catch (error) {
      $(".status-message").textContent = t("unsupportedPage");
    }
  }

  async function setLanguage(locale) {
    if (!LANGUAGES.includes(locale)) locale = "en";
    await chrome.storage.local.set({[STORAGE_KEYS.language]: locale});
    try { await loadMessages(locale); } catch (error) { await loadMessages("en"); }
    $(".language-control span").textContent = t("language");
  }

  async function initialize() {
    const state = await chrome.storage.local.get({[STORAGE_KEYS.filter]: "off", [STORAGE_KEYS.language]: "en"});
    $("#language-select").value = LANGUAGES.includes(state[STORAGE_KEYS.language]) ? state[STORAGE_KEYS.language] : "en";
    await setLanguage($("#language-select").value);
    renderSelected(state[STORAGE_KEYS.filter]);
  }

  $("#language-select").addEventListener("change", (event) => setLanguage(event.target.value));
  $$('[data-filter]').forEach((button) => button.addEventListener("click", () => setFilter(button.dataset.filter)));
  initialize().catch(() => { $(".status-message").textContent = "Unable to load Prismate."; });
})();
