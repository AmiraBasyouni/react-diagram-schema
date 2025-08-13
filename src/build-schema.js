#!/usr/bin/env node

/* imports */
const path = require("path");
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
const isQuiet = process.argv.includes("--quiet");
const isVerbose = process.argv.includes("--verbose");
const isDebug = process.argv.includes("--debug");

const VERBOSITY = {
  quiet: 0, // only errors
  normal: 1, // + key milestones and warnings
  verbose: 3, // + "Parsing ... done" for each file
  debug: 4, // + schema output
};

// chosen from CLI flag
let verbosityLevel;
if (isQuiet) {
  verbosityLevel = VERBOSITY.quiet;
} else if (isVerbose) {
  verbosityLevel = VERBOSITY.verbose;
} else if (isDebug) {
  verbosityLevel = VERBOSITY.debug;
} else {
  verbosityLevel = VERBOSITY.normal;
}

// When logging:
function log(message, level = verbosityLevel.normal, type = "log") {
  if (level <= verbosityLevel && console[type]) console[type](message);
}

/* initializing stack */
const entryDirectory = process.argv[2]; //const { code, filename } = readSourceFile(inputFile);
const entryImportPath = "./";
const entryComponentName = process.argv[3];
stack.push({
  directory: entryDirectory,
  importPath: entryImportPath,
  componentName:
    entryComponentName && entryComponentName.startsWith("--")
      ? ""
      : entryComponentName,
});
/* guard against invalid inputs */
if (typeof entryDirectory != "string" || isFile(entryDirectory)) {
  throw new Error(
    `(build-schema) invalid path "${entryDirectory}", please provide a valid directory as your first argument (e.g. "./src")`,
  );
}
if (
  typeof entryComponentName === "string" &&
  !/^--/.test(entryComponentName) &&
  !/^[A-Z]/.test(entryComponentName)
) {
  // (when no component name is provided, assume a default export is available)
  // guard against invalid component names (if component name is provided)
  throw new Error(
    `(build-schema) invalid component name "${entryComponentName}", please provide a valid component's name as your second argument (e.g. "App")`,
  );
}

// START TIMER
const start = process.hrtime();
/* DFS Approach for traversing files */
while (stack.length > 0) {
  const { directory, importPath, componentName = "" } = stack.pop();
  log(`Parsing ${componentName}...`, VERBOSITY.verbose);
  log(
    `(build-schema) retrieved directory "${directory}", import path "${importPath}", and component name ${componentName}`,
    VERBOSITY.verbose,
  );
  const filePath = resolveFilePath(directory, importPath, componentName);
  /* guard against resolveFilePath failure */
  if (!filePath) {
    log(
      `(build-schema) could not resolve the file path from directory "${directory}" with the import path "${importPath}" for component "${componentName}"`,
      VERBOSITY.verbose,
      "warn",
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
    log(
      `(build-schema) failed to parse component "${componentName}" stored in the file "${filePath}"`,
      VERBOSITY.verbose,
      "warn",
    );
    continue;
  }
  /* account for when multiple components are defined in the same file */
  Object.values(schema).forEach((component) => {
    components[`${component.name}::${filePath}`] = component;
  });
  /* for each of the component's descendants whose declaration could not be found, */
  Object.values(schema).forEach((component) => {
    component.unresolvedDescendants.forEach((unresolvedDescendant) => {
      /* collect the descendant's import statement */
      const descendantImportPath = parseImport(code, unresolvedDescendant);
      /* guard against a descendant missing its import statement */
      if (!descendantImportPath) {
        warnings.push(
          `WARNING: (build-schema) the descendant "${unresolvedDescendant}" of component "${componentName}" could not be resolved within the file "${filePath}"`,
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
        log(
          `(build-schema) planning to visit directory "${directory}", with import path "${descendantImportPath}", to resolve "${unresolvedDescendant}"`,
          VERBOSITY.verbose,
        );
        stack.push({
          directory: path.join(directory, descendantImportPath),
          importPath: "./",
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
// END TIMER
const end = process.hrtime(start); // Calculates difference from start
const durationInMs = end[0] * 1000 + end[1] / 1000000;

/* OUTPUT schema to console */
if (isDebug && !isQuiet) {
  console.dir(components, { depth: null, colors: true });
}
if ((isVerbose || isDebug) && !isQuiet) {
  warnings.forEach((warning) => console.warn(warning));
}

log(
  `✅ Parsed ${Object.keys(components).length} components from ${filesVisited.size} files in ${durationInMs} milliseconds`,
  VERBOSITY.normal,
);

/* OUTPUT schema to file */
generateSchemaFile(components);
