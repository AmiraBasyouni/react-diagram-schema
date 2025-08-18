// resolveComponent.js
const resolveImport = require("./resolveImport");
const resolveExport = require("./resolveExport");

/**
 * Resolve the actual source file of a component symbol.
 *
 * @param {string} componentName - The name of the imported symbol (e.g. "ReactFlow").
 * @param {string} fromFile - The file where the import appears.
 * @param {string} sourceValue - The import source string (e.g. "@xyflow/react").
 * @returns {string|null} Final resolved file path of the symbol declaration.
 */
function resolveComponent(componentName, fromFile, sourceValue) {
  // Step 1: Find the entrypoint file for the import
  const entryFile = resolveImport(fromFile, sourceValue);
  if (!entryFile) {
    return null;
  }

  // Step 2: Follow exports recursively to find the actual declaration
  const declFile = resolveExport(componentName, entryFile);
  //console.log("(resolveComponent) declFile: ", declFile);
  //console.log("(resolveComponent) entryFile: ", entryFile);

  // If export resolution failed, fall back to entry file
  return declFile || entryFile;
}

module.exports = resolveComponent;

/* EXAMPLE USAGE
const resolveComponent = require("./resolveComponent");

const finalPath = resolveComponent(
  "ReactFlow",
  "@xyflow/react",
  "/Users/me/project/src/App.tsx"
);

console.log(finalPath);
// → "../../../../packages/react/src/components/ReactFlow.tsx"
*/
