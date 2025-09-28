/* (build-schema.js) Traverses all files starting from entry point to build full schema structure */

// imports
const path = require("path");
const parseCode = require("./parseCode");
const resolveFilePath = require("./resolveFilePath");
const readSourceFile = require("./readSourceFile");
const parseImport = require("./parseImport");
const resolveComponent = require("./resolveComponent");
const fs = require("fs");
const isFile = require("./utils/isFile");
const getDirectoryFromFilePath = require("./utils/getDirectoryFromFilePath");
const getRelativeFromAbsolutePath = require("./utils/getRelativeFromAbsolutePath");
const getAlias = require("./utils/getAlias");

// INITIALIZING VARIABLES
// warnings: an array to collect warnings related to insufficient data
// components: an object to store the schema
// filesVisited: a Map to prevent multiple visits to the same file
// stack: an array to organize visiting logic
const warnings = [];
const components = {};
const filesVisited = new Map();
const stack = [];

// build_schema
// 1. accepts <entryDirectory|entryFile> and [rootComponentName] and verbosity levels
//    Note: verbosity is retrieved from CLI logic {quiet: boolean, verbose: boolean, debug: boolean }
// 2. validates inputs <entryDirectory|entryFile> and [rootComponentName]
// 3. push the inputs to the stack
// 4. traverse user's project files using DFS
function build_schema(entryDirectory, rootComponentName, verbosity = {}) {
  // function for logging messages:
  function log(message, type = "log") {
    if (console[type]) console[type](message);
  }

  // Input Validation: detect invalid <entryDirectory|entryFile>
  if (
    typeof entryDirectory != "string" ||
    (!isFile(entryDirectory) && !fs.existsSync(entryDirectory))
  ) {
    throw new Error(
      `(build-schema) invalid path "${entryDirectory}", please provide a valid directory or file path as your first a  rgument (e.g. "./src")`,
    );
  }

  // Input Validation: detect invalid [rootComponentName]
  if (
    typeof entryComponentName === "string" &&
    !/^--/.test(rootComponentName) &&
    !/^[A-Z]/.test(rootComponentName)
  ) {
    // (when no component name is provided, assume a default export is available)
    // guard against invalid component names (if component name is provided)
    throw new Error(
      `(build-schema) invalid component name "${rootComponentName}", please provide a valid component name as your s  econd argument (e.g. "App")`,
    );
  }

  // push the entryDirectory and rootComponentName to the stack
  stack.push({
    directory: isFile(entryDirectory)
      ? getDirectoryFromFilePath(entryDirectory)
      : entryDirectory,
    importPath: "./",
    componentName:
      rootComponentName && rootComponentName.startsWith("--")
        ? ""
        : rootComponentName,
  });

  // START TIMER
  const start = process.hrtime();

  // Start Traversing user's React files using DFS
  while (stack.length > 0) {
    const { directory, importPath = "./", componentName = "" } = stack.pop();
    if (verbosity.verbose) {
      log(`Parsing ${componentName}...`);
      log(
        `(build-schema) retrieved directory "${directory}", import path "${importPath}", and component name ${componentName}`,
      );
    }
    const relativeFilePath = resolveFilePath(
      directory,
      importPath,
      componentName,
    );
    // Guard Clause: on resolveFilePath() failure, log a warning and skip the current file
    if (!relativeFilePath) {
      if (verbosity.verbose) {
        log(
          `(build-schema) could not resolve the file path from directory "${directory}" with the import path "${importPath}" for component "${componentName}"`,
          "warn",
        );
      }
      continue;
    }
    // Guard Clause: if this file is marked as visited, skip it (e.g. in the case of two components importing one another)
    if (filesVisited.has(relativeFilePath)) {
      continue;
    }
    // mark this file as visited
    filesVisited.set(relativeFilePath, true);

    // INITIALIZING VARIABLES
    // code: stores the file's code as a string
    // schema: stores the generated schema of this file
    const code = readSourceFile(relativeFilePath);
    const schema = parseCode(code, relativeFilePath);
    // Guard Clause: on parseCode() failure, log a warning and skip the current file
    if (!schema) {
      if (verbosity.verbose) {
        log(
          `(build-schema) failed to parse component "${componentName}" stored in the file "${relativeFilePath}"`,
          "warn",
        );
      }
      continue;
    }

    // account for when multiple components are defined in the same file
    // create Unique IDs
    Object.values(schema).forEach((component) => {
      const alias = getAlias(code, component.name);
      // UID for default exported component is the component's imported name
      if (component.defaultExport) {
        components[`${componentName}::${relativeFilePath}`] = component;
        // UID for imported components that have an alias uses alias when available
      } else if (alias) {
        components[`${alias}::${relativeFilePath}`] = component;
        // UID for all other components uses the assigned name of that component
      } else {
        components[`${component.name}::${relativeFilePath}`] = component;
      }
    });
    // UNRESOLVED DESCENDANTS
    // for each of the component's descendants whose declaration could not be found,
    Object.values(schema).forEach((component) => {
      component.unresolvedDescendants.forEach((unresolvedDescendant) => {
        // collect the descendant's import statement
        const descendantImportPath = parseImport(code, unresolvedDescendant);

        // resolve descendant's import to an absolute file path
        const resolvedImport_AbsoluteFilePath = resolveComponent(
          unresolvedDescendant,
          path.resolve(process.cwd(), relativeFilePath),
          descendantImportPath,
        );

        // transform absolute file path to a relative file path
        const resolvedImport_RelativeFilePath = getRelativeFromAbsolutePath(
          resolvedImport_AbsoluteFilePath,
        );

        // Guard Clause: if the import statement of this descendant is missing/invalid, log a warning and skip this descendant
        if (!descendantImportPath) {
          warnings.push(
            `WARNING: (build-schema) the descendant "${unresolvedDescendant}" of component "${componentName}" could not be resolved within the file "${relativeFilePath}"`,
          );
        } else {
          // update component's descendant's file path
          component.descendants?.set(unresolvedDescendant, {
            location: { filepath: resolvedImport_RelativeFilePath },
          });

          if (resolvedImport_RelativeFilePath) {
            // plan on visiting this descendant by adding it to the stack
            if (verbosity.verbose) {
              log(
                `(build-schema) planning to visit "${resolvedImport_RelativeFilePath}" to resolve "${unresolvedDescendant}"`,
              );
            }
            stack.push({
              directory: resolvedImport_RelativeFilePath,
              importPath: "./",
              componentName: unresolvedDescendant,
            });
          }
        }
      });
      // clear and hide unresolvedDescendants from JSON file output
      component.unresolvedDescendants = undefined;
      if (!component.provider) {
        // transform component descendants from type Map to type Array
        component.descendants = Array.from(component.descendants.entries()).map(
          ([name, metadata]) => `${name}::${metadata.location.filepath}`,
        );
      }
    });
  }

  // END TIMER
  const end = process.hrtime(start); // Calculates difference from start
  // durationInMs: stores the time it took to parse all of the user's React source code
  const durationInMs = end[0] * 1000 + end[1] / 1000000;

  // log schema to the console for quick visual analysis
  if (verbosity.debug) {
    console.dir(components, { depth: null, colors: true });
  }
  // log collected warnings
  if (verbosity.verbose || verbosity.debug) {
    warnings.forEach((warning) => console.warn(warning));
  }

  // log success message since we have completed the parsing and schema generation process
  if (verbosity.verbose) {
    log(
      `✅ Success: Parsed ${Object.keys(components).length} components from ${filesVisited.size} files in ${durationInMs} milliseconds`,
    );
  }

  // return schema object for optional further analysis
  return components;
}

module.exports = build_schema;
