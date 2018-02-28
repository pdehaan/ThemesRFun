import {validate} from './schema';
import {defaultColors, presetColors} from './src/lib/constants';

// validate(defaultColors)
//   .then(result => {
//     console.log('defaultColors:', 'success!', /* JSON.stringify(result) */);
//   })
//   .catch(err => {
//     console.error('defaultColors:', JSON.stringify(err.errors, null, 2));
//     process.exitCode = 1;
//   });

// presetColors.forEach(async (colors, idx) => {
//   const prefix = `presetColors[${idx}]:`;
//   try {
//     const result = await validate(colors);
//     console.log(prefix, 'success!', /* JSON.stringify(result) */);
//   } catch (err) {
//     console.error(prefix, JSON.stringify(err.errors, null, 2));
//     process.exitCode = 2;
//   }
// });

(async () => {
  try {
    const result = await validate(defaultColors);
    console.log('defaultColors:', 'success!', /* JSON.stringify(result) */);
  } catch (err) {
    console.error('defaultColors:', JSON.stringify(err.errors, null, 2));
    process.exitCode = 1;
  }

  presetColors.forEach(async (colors, idx) => {
    const prefix = `presetColors[${idx}]:`;
    try {
      const result = await validate(colors);
      console.log(prefix, 'success!', /* JSON.stringify(result) */);
    } catch (err) {
      // console.error(prefix, JSON.stringify(err.errors, null, 2));
      console.error(prefix);
      err.errors.forEach(error => {
        switch (error.keyword) {
          case 'additionalProperties':
            console.error(`- ${error.dataPath} ${error.message}: ${error.params.additionalProperty}`);
            break;
          case 'required':
            console.error(`- ${error.dataPath} ${error.message}`);
            break;
          default:
            console.error(error);
            break;
        }
      });
      process.exitCode = 2;
    }
  });
})();
