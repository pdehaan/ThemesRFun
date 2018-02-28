import defaultColors from './default-colors.json';
import preset1 from './presets/1.json';
import preset2 from './presets/2.json';
import preset3 from './presets/3.json';
import preset4 from './presets/4.json';
import preset5 from './presets/5.json';

export const CHANNEL_NAME = 'Themer';

export const surveyUrl = 'https://qsurvey.mozilla.com/s3/Test-Pilot-Themer-Feedback';

export const colorLabels = {
  toolbar: 'Toolbar Color',
  toolbar_text: 'Toolbar Icons and Text',
  accentcolor: 'Background Color',
  textcolor: 'Background Tab Text Color',
  toolbar_field: 'Search Bar Color',
  toolbar_field_text: 'Search Text'
};

export const colorsWithAlpha = [
  'toolbar',
  'toolbar_field'
];

export const presetColors = [
  {...defaultColors},
  preset1,
  preset2,
  preset3,
  preset4,
  preset5
];
