const path = require("path");
const isFile = require("./isFile");

/**
 * Given a file path, returns its directory.
 * @param {string} filePath - Path to the file.
 * @returns {string} Directory path containing the file.
 */
function getDirectoryFromFilePath(filePath) {
  return isFile(filePath) ? path.dirname(filePath) + path.sep : null;
}

// Example:
//console.log(getDirectoryFromFilePath("./index.js")); // "./"
//console.log(getDirectoryFromFilePath("/home/user/app/index.js")); // "/home/user/app/"

module.exports = getDirectoryFromFilePath;
