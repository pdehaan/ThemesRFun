import React from 'react';
import classNames from 'classnames';

import './index.scss';

import Metrics from '../../../../lib/metrics';

export const Banner = ({ addonUrl, bottom = false }) => (
  <div className={classNames('banner', { 'banner--bottom': bottom })}>
    <div className="banner__content">
      <span>Put the 🔥 in Firefox</span>
      <a
        href={addonUrl}
        onClick={() => Metrics.installStart()}
        className="banner__button"
      >
        Install Themer
      </a>
    </div>
    {!bottom && <div className="banner__spacer" />}
  </div>
);

export default Banner;
