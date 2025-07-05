const fs = require("fs");
const path = require("path");

function readSourceFile(inputPath) {
  if (!inputPath) {
    console.error("ERROR: Please provide a file path.");
    process.exit(1);
  }

  const absolutePath = path.resolve(inputPath);

  try {
    const code = fs.readFileSync(absolutePath, "utf-8");
    return { code, filename: path.basename(inputPath) };
  } catch (err) {
    console.error(`ERROR: Failed to read file: ${inputPath}\n`, err.message);
    process.exit(1);
  }
}

module.exports = readSourceFile;
