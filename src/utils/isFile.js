const fs = require("fs");

// Check if a directory exists
function isDirectory(dirPath) {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false; // Path doesn't exist or no access
  }
}

// Check if a file exists
function isFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

// Check if path exists (file or directory)
function pathExists(p) {
  return fs.existsSync(p);
}

module.exports = { isDirectory, isFile, pathExists };
