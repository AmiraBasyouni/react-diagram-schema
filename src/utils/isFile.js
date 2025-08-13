const fs = require("fs");

function isFile(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    //console.warn(`Error: (isFile) ${e}`);
    return false; // path doesn't exist or some other error
  }
}

module.exports = isFile;
