const fs = require("fs");
const path = require("path");
const { transpileTSFile } = require("./utils/compileTS");

function readSourceFile(inputPath) {
  if (!inputPath) {
    console.error("ERROR: Please provide a file path.");
    process.exit(1);
  }

  const absolutePath = path.resolve(inputPath);
  const ext = path.extname(absolutePath);

  try {
    let code;

    if (ext === ".ts" || ext === ".tsx") {
      code = transpileTSFile(absolutePath); // Compile TS/TSX
    } else {
      code = fs.readFileSync(absolutePath, "utf-8"); // Read JS/JSX/other
    }
    return code;
  } catch (err) {
    console.error(`ERROR: Failed to read file: ${inputPath}\n`, err.message);
    process.exit(1);
  }
}

module.exports = readSourceFile;
