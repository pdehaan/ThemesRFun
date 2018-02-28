import Ajv from 'ajv';

import {colorLabels, colorsWithAlpha} from './src/lib/constants';

const hue = {type: 'integer', minimum: 0, maximum: 360};
const saturation = {type: 'integer', minimum: 0, maximum: 100};
const lightness = {type: 'integer', minimum: 0, maximum: 100};
const alpha = {type: 'number', minimum: 0, maximum: 100};

const hsl = {
  type: 'object',
  additionalProperties: false,
  properties: {
    h: hue,
    s: saturation,
    l: lightness
  }
};
hsl.required = Object.keys(hsl.properties);

const hsla = {
  ...hsl,
  properties: {
    ...hsl.properties,
    a: alpha
  }
};
hsla.required = Object.keys(hsla.properties);

const properties = Object.keys(colorLabels)
  .reduce((obj, label) => {
    if (colorsWithAlpha.includes(label)) {
      obj[label] = {...hsla};
    } else {
      obj[label] = {...hsl};
    }
    return obj;
  }, {});

const schema = {
  $async: true,
  type: 'object',
  additionalProperties: false,
  properties
};
schema.required = Object.keys(colorLabels);

const ajv = new Ajv({allErrors: true});

export async function validate(data) {
  return await ajv.validate(schema, data);
}
