# Font Loader

As of writing this, Stash doesn't have a way of modifying the font-src CSP directive. This is a plugin which adds a function to the window object to load fonts from external sources for your theme. It works by pulling the font files with `fetch`, transforming them into base64, and loading the fonts using the FontFace API.

## Usage

> [!IMPORTANT]
>
> ### Your theme must include CSP directives
>
> Plugins are able to add URLs to the `connect-src` directive. This is required otherwise the browser will block the request when attempting to fetch your fonts. A full example [here](../themeDope/themeDope.yml).

`stashLoadFonts(familyName, fonts)`

`familyName` string representing the font family
`fonts` either an array of well-defined font URLs, or an array of [FontFaceDescriptors](https://developer.mozilla.org/en-US/docs/Web/API/FontFace) with the URL. `FontFaceDescriptors & { url: string }`

```
{
  url: string;
  family?: string;
  weight?: string | number;
  style?: string;
  stretch?: string;
  display?: string;
}
```

### Full example

```js
const base = "https://fonts.bunny.net/rethink-sans/files";
const fontsToLoad = [
  { weight: 400, url: `${base}/rethink-sans-latin-400-normal.woff2` },
  { weight: 500, url: `${base}/rethink-sans-latin-500-normal.woff2` },
  { weight: 600, url: `${base}/rethink-sans-latin-600-normal.woff2` },
  { weight: 700, url: `${base}/rethink-sans-latin-700-normal.woff2` },
  { weight: 800, url: `${base}/rethink-sans-latin-800-normal.woff2` },
];

stashLoadFonts("ReThink Sans", fontsToLoad);
```
