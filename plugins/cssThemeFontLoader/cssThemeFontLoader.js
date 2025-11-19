"use strict";
(() => {
  function loadFonts(familyName, fonts = [], opts = {}) {
    const defaultFetchOpts = {
      cache: "force-cache",
      ...(opts.fetch || {}),
    };

    function arrayBufferToBase64(buffer) {
      const bytes = new Uint8Array(buffer);
      const chunkSize = 0x8000;
      let binary = "";
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(
          null,
          bytes.subarray(i, i + chunkSize)
        );
      }
      return btoa(binary);
    }

    function detectFormat(url) {
      const clean = url.split("?")[0].split("#")[0];
      const ext = clean.includes(".")
        ? clean.split(".").pop().toLowerCase()
        : "";
      switch (ext) {
        case "woff2":
          return { format: "woff2", mime: "font/woff2" };
        case "woff":
          return { format: "woff", mime: "font/woff" };
        case "ttf":
          return { format: "truetype", mime: "font/ttf" };
        case "otf":
          return { format: "opentype", mime: "font/otf" };
        case "eot":
          return {
            format: "embedded-opentype",
            mime: "application/vnd.ms-fontobject",
          };
        default:
          return { format: "woff2", mime: "font/woff2" };
      }
    }

    async function fetchAsDataSrc(url) {
      const { format, mime } = detectFormat(url);
      const res = await fetch(url, defaultFetchOpts);
      if (!res.ok)
        throw new Error(
          `Failed to fetch ${url}: ${res.status} ${res.statusText}`
        );
      const buffer = await res.arrayBuffer();
      const b64 = arrayBufferToBase64(buffer);
      return {
        src: `url('data:${mime};base64,${b64}') format('${format}')`,
        format,
        mime,
      };
    }

    async function loadFontVariant(spec) {
      const url = spec.url;
      if (!url) throw new Error("Font spec missing url");
      const family = spec.family || familyName || "Custom Font";
      const weight = spec.weight != null ? String(spec.weight) : "400";
      const style = spec.style || "normal";
      const stretch = spec.stretch || "100%";
      const display = spec.display || "swap";

      const { src } = await fetchAsDataSrc(url);
      const ff = new FontFace(family, src, {
        weight,
        style,
        stretch,
        display,
      });
      await ff.load();
      document.fonts.add(ff);
      return ff;
    }

    const specs = (fonts || []).map((f) => {
      if (typeof f === "string") return { url: f };
      return { ...f };
    });

    return specs.map((spec) =>
      loadFontVariant(spec).catch((err) => {
        console.error(
          `[cssThemeFontLoader] Font loading failed (${spec.url}):`,
          err
        );
        throw err;
      })
    );
  }

  window.stashLoadFonts = loadFonts;
})();
