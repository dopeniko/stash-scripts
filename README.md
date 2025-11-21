### How do I install and use these plugins?

1. Follow the [Stash guide on adding a plugin source](https://docs.stashapp.cc/plugins/#adding-sources)
2. Add this repository with Source index URL: `https://dopeniko.github.io/stash-scripts/main/index.yml` ![adding the plugin index](.assets/adding-source.png)
3. Before installing any plugins, read the documentation to ensure you have all the required dependencies

## Plugins

### [Discord Presence](plugins/discordPresence/)

Display your currently playing scene in your Discord activity. <sub>(I am not responsible for any mishaps)</sub>

### [Jump to Now Playing](plugins/jumpToNowPlaying)

Adds a button on the queue control to scroll back to the currently playing video.

## Themes and UI tweaks

### [Dope Theme](plugins/themeDope/)

My personal theme, with a customisable base colour.

### [No Scene Card Popovers](/plugins/themeNoSceneCardPopovers/)

Remove popovers footer from scene cards.

## Plugin libraries

### [Dev Theme Helper](plugins/cssThemeDev)

Helper script if you want to develop your own theme. Continuously polls for http://localhost:8080/theme.css and adds it to the page styles.

### [Font Loader](plugins/cssThemeDev)

Allows your theme to fetch fonts from external CDNs (workaround for `font-src` CSP directive on Firefox).
