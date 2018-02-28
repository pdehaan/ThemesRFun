import {validate} from './schema';
import {presetColors} from './src/lib/constants';
import defaultColors from './src/lib/default-colors.json';

(async () => {
  presetColors.forEach(async (colors, idx) => {
    const prefix = `presetColors[${idx}]`;
    try {
      const result = await validate(colors);
      console.log(prefix, 'success!', /* JSON.stringify(result) */);
    } catch (err) {
      // console.error(prefix, JSON.stringify(err.errors, null, 2));
      // console.error(prefix);
      err.errors.forEach(error => {
        switch (error.keyword) {
          case 'additionalProperties':
            console.error(`${prefix}${error.dataPath} ${error.message}: ${error.params.additionalProperty}`);
            break;
          case 'required':
            console.error(`${prefix}${error.dataPath} ${error.message}`);
            break;
          default:
            console.error(error);
            break;
        }
      });
      process.exitCode = 1;
    }
  });
})();
