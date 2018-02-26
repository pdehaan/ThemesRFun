// Use of package.json for configuration
import packageMeta from '../../package.json';

import { makeLog } from './utils';
import { selectors } from './store';
import { colorsWithAlpha } from './constants';

const log = makeLog('metrics');

const GA_URL = 'https://ssl.google-analytics.com/collect';
/* eslint-disable prefer-destructuring */
const GA_TRACKING_ID = packageMeta.config.GA_TRACKING_ID;
const GA_APP_ID = packageMeta.extensionManifest.applications.gecko.id;
const GA_APP_VERSION = packageMeta.version;
/* eslint-enable prefer-destructuring */

let clientUUID = null;

// Time after which to consider add-on install to have failed, because we have
// no good way to tell if the install has been cancelled - only if the add-on
// becomes available
const INSTALL_FAILURE_DELAY = 10 * 1000;
let installTimer = null;

// See also: https://github.com/mozilla/ThemesRFun/blob/master/docs/metrics.md

// Custom metrics
let cm1; // integer count of select-full events from start of visit
let cm2; // integer count of select-bg events from start of visit
let cm3; // integer count of select-color events from start of visit

// Custom dimensions
let cd1; // does the user have the add-on installed. One of true or false
let cd2; // did this visit originate from an add-on click. One of true or false
let cd3; // did the user receive a theme as a query parameter. One of true or
// false
let cd4; // engaged with any theme-change event. One of true or false based on
// whether user has fired any theme-change during their visit.
let cd5; // hsla (csv) of the toolbar
let cd6; // hsl (csv) of the toolbar_text
let cd7; // hsl (csv) of the accentcolor
let cd8; // hsl (csv) of the textcolor
let cd9; // hsla (csv) of the toolbar_field
let cd10; // hsl (csv) of the toolbar_field_text
let cd11; // unique integer id of the background pattern selected

const COLORS_TO_DIMENSIONS = {
  toolbar: 'cd5',
  toolbar_text: 'cd6',
  accentcolor: 'cd7',
  textcolor: 'cd8',
  toolbar_field: 'cd9',
  toolbar_field_text: 'cd10'
};

const hslaToCSV = (name, { h, s, l, a }) =>
  `${h},${s},${l}${colorsWithAlpha.includes(name) ? `,${a}` : ''}`;

const Metrics = {
  init() {
    cm1 = 0;
    cm2 = 0;
    cm3 = 0;
    cd1 = false;
    cd2 = false;
    cd3 = false;
    cd4 = false;
  },

  storeMiddleware() {
    return ({ getState }) => next => action => {
      const result = next(action);

      if (action.type === 'SET_THEME') {
        const theme = selectors.theme(getState());
        this.setTheme(theme);
        if (action.meta && action.meta.userEdit) {
          this.setThemeChanged(true);
        }
      }

      return result;
    };
  },

  setClientUUID(value) {
    clientUUID = value;
  },

  getClientUUID() {
    return clientUUID;
  },

  setHasAddon(value) {
    cd1 = value;
  },

  setWasAddonClick(value) {
    cd2 = value;
  },

  setReceivedTheme(value) {
    cd3 = value;
  },

  setThemeChanged(value) {
    cd4 = value;
  },

  themeToDimensions(theme) {
    return Object.entries(theme.colors).reduce(
      (acc, [name, hsla]) => ({
        ...acc,
        [COLORS_TO_DIMENSIONS[name]]: hslaToCSV(name, hsla)
      }),
      { cd11: theme.images.headerURL }
    );
  },

  setTheme(theme) {
    const themeDimensions = this.themeToDimensions(theme);
    log('update theme', themeDimensions);
    ({ cd5, cd6, cd7, cd8, cd9, cd10, cd11 } = themeDimensions);
  },

  installStart() {
    if (installTimer) {
      clearTimeout(installTimer);
    }
    installTimer = setTimeout(() => {
      this.installFailure();
    }, INSTALL_FAILURE_DELAY);

    this.sendEvent({
      ec: 'install-addon',
      ea: 'button-click',
      el: 'install-trigger',
      cm1,
      cm2,
      cm3,
      cd3,
      cd4,
      cd5,
      cd6,
      cd7,
      cd8,
      cd9,
      cd10,
      cd11
    });
  },

  installFailure() {
    this.sendEvent({
      ec: 'install-addon',
      ea: 'poll-event',
      el: 'install-fail'
    });
  },

  installSuccess() {
    if (!installTimer) {
      // Skip this event if there's no install timer in progress.
      return;
    }
    clearTimeout(installTimer);
    this.sendEvent({
      ec: 'install-addon',
      ea: 'poll-event',
      el: 'install-success'
    });
  },

  themeChangeFull(themeId) {
    cm1++;
    this.setThemeChanged(true);
    this.sendEvent({
      ec: 'theme-change',
      ea: 'select-full',
      el: themeId,
      cm1,
      cm2,
      cm3,
      cd1,
      cd2
    });
  },

  themeChangeBackground(backgroundId) {
    cm2++;
    this.setThemeChanged(true);
    this.sendEvent({
      ec: 'theme-change',
      ea: 'select-background',
      el: backgroundId,
      cm1,
      cm2,
      cm3,
      cd1,
      cd2,
      cd3,
      cd11
    });
  },

  themeChangeColor(colorName) {
    cm3++;
    this.setThemeChanged(true);
    this.sendEvent({
      ec: 'theme-change',
      ea: 'select-color',
      el: colorName,
      cm1,
      cm2,
      cm3,
      cd1,
      cd2,
      cd3
    });
  },

  shareClick() {
    this.sendEvent({
      ec: 'share-engagement',
      ea: 'button-click',
      cm1,
      cm2,
      cm3,
      cd1,
      cd2,
      cd3,
      cd4,
      cd5,
      cd6,
      cd7,
      cd8,
      cd9,
      cd10,
      cd11
    });
  },

  linkClick(el) {
    // if el === download-firefox, add the following dimensions to this event
    const downloadFirefoxDimensions =
      el !== 'download-firefox' ? {} : { cd5, cd6, cd7, cd8, cd9, cd10, cd11 };
    this.sendEvent({
      ec: 'link-engagement',
      ea: 'click',
      el,
      cm1,
      cm2,
      cm3,
      cd1,
      cd2,
      cd3,
      cd4,
      ...downloadFirefoxDimensions
    });
  },

  receiveTheme(action, theme) {
    this.sendEvent({
      ec: 'receive-theme',
      ea: 'button-click',
      el: action,
      cd1,
      ...this.themeToDimensions(theme)
    });
  },

  finishVisit() {
    this.sendEvent({
      ec: 'finish-visit',
      ea: 'leave',
      cm2,
      cm3,
      cd1,
      cd2,
      cd3,
      cd4,
      cd5,
      cd6,
      cd7,
      cd8,
      cd9,
      cd10,
      cd11
    });
  },

  sendEvent(params) {
    if (
      !GA_TRACKING_ID ||
      !clientUUID ||
      (typeof navigator !== 'undefined' && navigator.doNotTrack === 1)
    ) {
      return;
    }

    const event = {
      v: 1,
      aip: 1, // anonymize user IP addresses
      an: GA_APP_ID,
      av: GA_APP_VERSION,
      tid: GA_TRACKING_ID,
      cid: clientUUID,
      t: 'event',
      ...params
    };

    log('sendEvent', clientUUID, event);

    // Form-encode the event
    const encoded = Object.entries(event)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join('&');

    // Send using background beacon, if available. Otherwise use fetch()
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon(GA_URL, encoded);
    } else if (typeof fetch !== 'undefined') {
      fetch(GA_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: encoded
      })
        .then(() => log(`Sent GA message via fetch: ${encoded}`))
        .catch(err => log(`GA sending via fetch failed: ${err}`));
    }
  }
};

export default Metrics;
