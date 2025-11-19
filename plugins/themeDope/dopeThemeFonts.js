"use strict";
(() => {
  const base = "https://fonts.bunny.net/rethink-sans/files";
  const fontsToLoad = [
    { weight: 400, url: `${base}/rethink-sans-latin-400-normal.woff2` },
    { weight: 500, url: `${base}/rethink-sans-latin-500-normal.woff2` },
    { weight: 600, url: `${base}/rethink-sans-latin-600-normal.woff2` },
    { weight: 700, url: `${base}/rethink-sans-latin-700-normal.woff2` },
    { weight: 800, url: `${base}/rethink-sans-latin-800-normal.woff2` },
  ];

  stashLoadFonts("Rethink Sans", fontsToLoad);
})();
