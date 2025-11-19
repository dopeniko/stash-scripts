"use strict";
(async function () {
  const PLUGIN_ID = "themeDope";
  const userConfig = await csLib.getConfiguration(PLUGIN_ID, {});

  if (!userConfig.primaryColour) {
    return;
  }

  try {
    if (typeof document === "undefined") return;

    var root = document.documentElement;
    root.style.setProperty("--primary", userConfig.primaryColour);
  } catch (err) {
    console.error("[dopeTheme] Error setting CSS variable", err);
  }
})();
