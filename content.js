(function () {
  "use strict";

  const FILTER_IDS = [
    "protanopia",
    "protanomaly",
    "deuteranopia",
    "deuteranomaly",
    "tritanopia",
    "tritanomaly",
    "achromatopsia",
    "achromatomaly"
  ];
  const STYLE_ID = "colourblind-styling";
  const SVG_ID = "colourblind-filters";
  const FILTER_PREFIX = "colourblind-filter-";
  const STORAGE_KEY = "selectedFilter";

  const matrices = {
    protanopia: "0.567,0.433,0,0,0 0.558,0.442,0,0 0,0.242,0.758,0,0 0,0,0,1,0",
    protanomaly: "0.817,0.183,0,0,0 0.333,0.667,0,0 0,0.125,0.875,0,0 0,0,0,1,0",
    deuteranopia: "0.625,0.375,0,0,0 0.7,0.3,0,0 0,0.3,0.7,0,0 0,0,0,1,0",
    deuteranomaly: "0.8,0.2,0,0,0 0.258,0.742,0,0 0,0.142,0.858,0,0 0,0,0,1,0",
    tritanopia: "0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0",
    tritanomaly: "0.967,0.033,0,0,0 0,0.733,0.267,0,0 0,0.183,0.817,0,0 0,0,0,1,0",
    achromatopsia: "0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0,0,0,1,0",
    achromatomaly: "0.618,0.320,0.062,0,0 0.163,0.775,0.062,0,0 0.163,0.320,0.516,0,0 0,0,0,1,0"
  };

  function ensureBody(callback) {
    if (document.body) {
      callback();
      return;
    }

    new MutationObserver((mutations, observer) => {
      if (!document.body) return;
      observer.disconnect();
      callback();
    }).observe(document.documentElement, {childList: true});
  }

  function ensureFilterDefinitions() {
    if (document.getElementById(SVG_ID)) return;

    const container = document.createElement("div");
    container.id = SVG_ID;
    container.setAttribute("style", "height:0;padding:0;margin:0;line-height:0;");
    container.innerHTML = `<svg style="display:none"><defs>${FILTER_IDS.map((id) =>
      `<filter id="${FILTER_PREFIX}${id}"><feColorMatrix type="matrix" values="${matrices[id]}" /></filter>`
    ).join("")}</defs></svg>`;
    document.body.appendChild(container);
  }

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head?.appendChild(style) || document.body.appendChild(style);
    }
    return style;
  }

  function applyFilter(filterId) {
    const style = ensureStyle();
    const validFilter = filterId === "off" || FILTER_IDS.includes(filterId);
    const value = validFilter && filterId !== "off" ? `url(#${FILTER_PREFIX}${filterId})` : "none";
    style.textContent = `html { filter: ${value} !important; }`;
  }

  async function applyStoredFilter() {
    const result = await chrome.storage.local.get({[STORAGE_KEY]: "off"});
    applyFilter(result[STORAGE_KEY]);
  }

  function initialize() {
    ensureFilterDefinitions();
    applyStoredFilter().catch((error) => console.warn("Unable to restore filter.", error));
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "apply-filter") {
      applyFilter(message.filterId);
    }
  });

  ensureBody(initialize);
})();
