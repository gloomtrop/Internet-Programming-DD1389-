const fs = require('fs');
const { join } = require('path');

const resolvePublicPath = (path) => join(__dirname, '..', 'public', path);

const readFile = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});

module.exports = {
  readFile, resolvePublicPath,
};
