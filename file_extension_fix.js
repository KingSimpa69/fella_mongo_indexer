const fs = require('fs');
const path = require('path');

const directory = './meta';

fs.readdir(directory, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach((file, index) => {
    const oldPath = path.join(directory, file);
    const newPath = path.join(directory, `${file}.json`);

    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error(`Error renaming file ${file}:`, err);
      } else {
        console.log(`Renamed file ${file} to ${file}.json`);
      }

      if (index === files.length - 1) {
        console.log('All files renamed.');
      }
    });
  });
});
