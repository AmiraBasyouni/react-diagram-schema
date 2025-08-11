const ts = require("typescript");
const fs = require("fs");

/**
 * Transpile a TypeScript/TSX file to JavaScript.
 * @param {string} filePath
 * @returns {string} compiled JS code as string
 */
function transpileTSFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");

  const result = ts.transpileModule(code, {
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
    },
    fileName: filePath,
  });

  return result.outputText;
}

module.exports = { transpileTSFile };
