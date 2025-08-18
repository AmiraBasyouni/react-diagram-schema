const path = require("path");

/**
 * Converts an absolute path into a path relative to the project root.
 * @param {string} absolutePath - Absolute file or directory path.
 * @returns {string} Relative path from the project root.
 */
function getRelativeFromAbsolutePath(absolutePath) {
  if (!absolutePath) {
    return null;
  }
  const projectRootDir = process.cwd();
  return path.relative(projectRootDir, absolutePath);
}

// Example:
//console.log(getRelativeFromAbsolutePath("/home/user/myproject/src/index.js"));
// "src/index.js"

module.exports = getRelativeFromAbsolutePath;
