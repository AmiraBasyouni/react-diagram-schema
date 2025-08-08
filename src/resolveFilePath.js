/* (resolveFilePath) objective: find the file containing the declaration of a given component, the way a bundler does it */

/* imports */
const path = require("path");
const fs = require("fs");
const componentIsDeclaredInCode = require("./utils/componentIsDeclaredInCode");
const isFile = require("./utils/isFile");

function resolveFilePath(directory, importPath, componentName) {
  /* store user's current working directory */
  const projectRootDir = process.cwd();

  /* normalize the import path */
  const absolutePath = path.resolve(directory, importPath);

  /* if import path lead directly to a file path, */
  if (isFile(absolutePath)) {
    /* omit the user's private file structure */
    const relativePath = path.relative(projectRootDir, absolutePath);
    /* return the file path */
    return relativePath;
  }

  /* create candidate file paths (in order of priority) */
  const candidateFiles = [
    path.join(absolutePath, componentName + ".tsx"),
    path.join(absolutePath, componentName + ".ts"),
    path.join(absolutePath, componentName + ".jsx"),
    path.join(absolutePath, componentName + ".js"),
    path.join(absolutePath, "index.tsx"),
    path.join(absolutePath, "index.ts"),
    path.join(absolutePath, "index.jsx"),
    path.join(absolutePath, "index.js"),
  ];

  for (const filePath of candidateFiles) {
    /* if the filePath exists, */
    if (fs.existsSync(filePath)) {
      /* scan the code */
      const code = fs.readFileSync(filePath, "utf-8");
      /* if component's declaration is found, */
      if (componentIsDeclaredInCode(code, componentName)) {
        /* omit the user's private file structure */
        const relativePath = path.relative(projectRootDir, filePath);
        return relativePath;
      }
    }
  }

  /* if the component declaration could not be found, */
  return null;
}

module.exports = resolveFilePath;
