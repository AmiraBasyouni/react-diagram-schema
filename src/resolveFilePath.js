// resolveFilePath.js
// objective: find the file containing the declaration of a given component, the way a bundler does it */

// imports
const path = require("path");
const fs = require("fs");
const parseFile = require("./parseFile");
const componentIsDeclaredInCode = require("./utils/componentIsDeclaredInCode");
const { isFile, pathExists } = require("./utils/isFile");

function resolveFilePath(entryPoint, componentName) {
  // store user's current working directory
  const projectRootDir = process.cwd();

  // normalize the import path
  //const absolutePath = path.resolve(entryPoint, importPath);

  // if entryPoint leads directly to a valid file path,
  if (isFile(entryPoint)) {
    // omit the user's private file structure
    const relativePath = path.relative(projectRootDir, entryPoint);
    // return the file path
    return relativePath;
  }

  // if entryPoint leads to a valid directory,
  // create candidate file paths (in order of priority)
  const candidateFiles = [];
  // if componentName was provided, check these file paths:
  if (componentName) {
    [
      path.join(entryPoint, componentName + ".tsx"),
      path.join(entryPoint, componentName + ".ts"),
      path.join(entryPoint, componentName + ".jsx"),
      path.join(entryPoint, componentName + ".js"),
    ].forEach((path) => candidateFiles.push(path));
  }
  // whether or not componentName was provided, check these file paths:
  [
    entryPoint + ".tsx",
    entryPoint + ".ts",
    entryPoint + ".jsx",
    entryPoint + ".js",
    path.join(entryPoint, "index.tsx"),
    path.join(entryPoint, "index.ts"),
    path.join(entryPoint, "index.jsx"),
    path.join(entryPoint, "index.js"),
  ].forEach((path) => candidateFiles.push(path));

  for (const filePath of candidateFiles) {
    // if the filePath exists,
    if (pathExists(filePath)) {
      // scan the code
      const code = fs.readFileSync(filePath, "utf-8");
      const topLevelDeclarations = parseFile(code);
      const isEntryComponent = true;
      // if component's declaration is found,
      if (
        componentIsDeclaredInCode(
          topLevelDeclarations,
          componentName,
          isEntryComponent,
        )
      ) {
        // omit the user's private file structure
        const relativePath = path.relative(projectRootDir, filePath);
        return relativePath;
      }
    }
  }

  // if the component declaration could not be found,
  return null;
}

module.exports = resolveFilePath;
