# ThemesRFun

Theming demo for Firefox Quantum and beyond. 

## Get Started

1. Install Node 6.2.x (e.g. using [node version manger][nvm]) - the latest LTS
   version seems to have issues running web-ext

1. Clone the repo, install dependencies, start the dev environment:
   
   ```
   git clone https://github.com/lmorchard/ThemesRFun.git
   cd ThemesRFun
   npm install
   npm start
   ```

   This will start a webpack-dev-server instance at port 8080 and start a
   watcher that will rebuild the browser extension with every file change.

1. In Firefox 57 + open `about:debugging` and load the
   `build/extension/manifest.json` file.

1. Visit `http://localhost:8080` to see the web-based theme editor - changes
   should be relayed through the temporarily installed add-on and alter the
   browser theme

[nvm]: https://github.com/creationix/nvm

## Build & Release

Deploying a release of this thing is currently manual and limited to @lmorchard
due to AMO signing keys. (TODO: Hook that up to circleci for dev, switch to
different keys for release)

The script `npm run release:dev` in `package.json` takes care of the following:

* Set `ADDON_URL` and `SITE_URL` vars to point at lmorchard.github.io/ThemesRFun

* Build the site

* Build & sign the add-on

* Copy the signed add-on into the site

* Deploy the site to Github Pages

Signing depends on [`WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET` environment
variables being set for use by `web-ext sign`][sign].

[sign]: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/web-ext_command_reference#web-ext_sign

## Caveats on Theming

It is my contention that there are a few issues with Lightweight Themes in FF
Quantum that should be resolved.

1. Themes enforce an ugly dropshadow on tab text if color contrast is not far
   enough apart.

2. The leftmost tab border has odd styling from a placeholder element that does
   not change if the first tab is focused.

3. The accent color on active tabs is the same as the background color on the
   tab strip.

In order to rectify issue 1 and partly rectify issue 2, I've added a
`userChrome.css` file to my Firefox profile with the following: 

```
@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");

.tabbrowser-tab { 
  text-shadow: none !important; 
}

.titlebar-placeholder[type="pre-tabs"] {
  border-inline-end: 1px solid var(--tabs-border) !important;
  opacity: 1 !important;
}

.tab-icon-sound {
  filter: none !important;
}

:root:-moz-lwtheme {
  --tab-line-color: var(--toolbar-color) !important;
}

.tab-line {
  height: 2.5px !important;
  opacity: .7 !important;
}

```

If you'd like to create a `userChrome.css` file you can do so by finding your
Firefox profile, making a directory called `chrome` and in it, a file called
`userChrome.css`. Pasting the above CSS and restarting Firefox will make your
world nicer as you demo this webExtension.

## TODO

- [ ] Social sharing buttons

- [ ] Pre-made curated themes (via link?)

- [ ] Tweak build & release for prod where add-on & site will be at different
  URLs and neither on github
