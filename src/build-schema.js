#!/usr/bin/env node

/* imports */
const parseCode = require("./parseCode");
const resolveFilePath = require("./resolveFilePath");
const readSourceFile = require("./readSourceFile");
const parseImport = require("./parseImport");
const generateSchemaFile = require("./generateSchema");
const isFile = require("./utils/isFile");

/* (build-schema.js) Traverses all files starting from entry point to build full schema structure */
/* initializing variables */
const warnings = []; // array to collect warnings related to insufficient data
const components = {};
const filesVisited = new Map();
const stack = [];

/* initializing stack */
const entryDirectory = process.argv[2]; //const { code, filename } = readSourceFile(inputFile);
const entryImportPath = "./";
const entryComponentName = process.argv[3];
stack.push({
  directory: entryDirectory,
  importPath: entryImportPath,
  componentName: entryComponentName,
});
/* guard against invalid inputs */
if (typeof entryDirectory != "string" || isFile(entryDirectory)) {
  throw new Error(
    `invalid path "${entryDirectory}", please provide a valid directory as your second argument (e.g. "./src")`,
  );
}
if (typeof entryComponentName != "string" || entryComponentName.length === 0) {
  throw new Error(
    `invalid component name "${entryComponentName}", please provide a valid component's name as your third argument (e.g. "App")`,
  );
}

/* DFS Approach for traversing files */
while (stack.length > 0) {
  const { directory, importPath, componentName } = stack.pop();
  console.log(
    `retrieved directory "${directory}", import path "${importPath}", and component name "${componentName}"`,
  );
  const filePath = resolveFilePath(directory, importPath, componentName);
  /* guard against resolveFilePath failure */
  if (!filePath) {
    console.log(filePath);
    console.warn(
      `could not resolve file path from directory "${directory}" with the import path "${importPath}" for component "${componentName}"`,
    );
    continue;
  }
  /* guard against repeating visits (e.g. in the case of two components importing one another) */
  if (filesVisited.has(filePath)) {
    continue;
  }
  filesVisited.set(filePath, true);
  const code = readSourceFile(filePath);
  const schema = parseCode(code, filePath);
  /* guard against parseCode failure */
  if (!schema) {
    console.warn(
      `Failed to parse component ${componentName} stored in the file ${filePath}`,
    );
    continue;
  }
  /* account for when multiple components are defined in the same file */
  schema.forEach((component) => {
    components[`${component.name}::${filePath}`] = component;
  });
  /* for each of the component's descendants whose declaration could not be found, */
  schema.forEach((component) => {
    component.unresolvedDescendants.forEach((unresolvedDescendant) => {
      /* collect the descendant's import statement */
      const descendantImportPath = parseImport(code, unresolvedDescendant);
      /* guard against a descendant missing its import statement */
      if (!descendantImportPath) {
        warnings.push(
          `The descendant ${unresolvedDescendant} of component ${componentName} could not be resolved within the file ${filePath}`,
        );
      } else {
        /* update component's descendant's file path */
        const descendantFilePath = resolveFilePath(
          directory,
          descendantImportPath,
          unresolvedDescendant,
        );
        component.descendants.set(unresolvedDescendant, {
          location: { filepath: descendantFilePath },
        });
        /* plan on visiting this descendant */
        console.log(
          `planning to visit directory ${directory}, in import path ${descendantImportPath}, to resolve ${unresolvedDescendant}`,
        );
        stack.push({
          directory,
          importPath: descendantImportPath,
          componentName: unresolvedDescendant,
        });
      }
    });
    /* clear and hide unresolvedDescendants from JSON file output */
    component.unresolvedDescendants = undefined;
    // transform component descendants from type Map to type Array
    component.descendants = Array.from(component.descendants.entries()).map(
      ([name, metadata]) => `${name}::${metadata.location.filepath}`,
    );
  });
}

/* OUTPUT schema to console */
console.dir(components, { depth: null, colors: true });
warnings.forEach((warning) => console.warn(warning));

/* OUTPUT schema to file */
generateSchemaFile(components);
