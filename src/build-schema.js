/* (build-schema.js) Traverses all files starting from entry point to build full schema structure */

// imports
const path = require("path");
const parseCode = require("./parseCode");
const resolveFilePath = require("./resolveFilePath");
const readSourceFile = require("./readSourceFile");
const parseImport = require("./parseImport");
const resolveComponent = require("./resolveComponent");
const { isFile, isDirectory, pathExists } = require("./utils/isFile");
const getRelativeFromAbsolutePath = require("./utils/getRelativeFromAbsolutePath");
const getAlias = require("./utils/getAlias");

// INITIALIZING VARIABLES
// warnings: an array to collect warnings related to insufficient data
// components: an object to store the schema
// filesVisited: a Map to prevent multiple visits to the same file
// importResolutions: a Map to prevent multiple resolutions for the same import path
// stack: an array to organize visiting logic
const warnings = [];
const components = {};
const filesVisited = new Map();
const importResolutions = new Map();
const stack = [];
const importedNames = [];
const node_modules = [];

// build_schema
// 1. accepts <entryDirectory|entryFile> and [rootComponentName] and verbosity levels
//    Note: verbosity is retrieved from CLI logic {quiet: boolean, verbose: boolean, debug: boolean }
// 2. validates inputs <entryDirectory|entryFile> and [rootComponentName]
// 3. push the inputs to the stack
// 4. traverse user's project files using DFS
function build_schema(entryPoint, rootComponentName, verbosity = {}) {
  // function for logging messages:
  function log(message, type = "log") {
    if (console[type]) console[type](message);
  }

  // Input Validation: detect invalid <entryDirectory|entryFile>
  if (typeof entryPoint != "string") {
    throw new Error(
      `(build-schema) invalid argument, the path "${entryPoint}" is not a string.
      Please provide a valid directory or file path as your first argument (e.g. "./src")`,
    );
  } else if (!pathExists(entryPoint)) {
    throw new Error(
      `(build-schema) invalid argument, the path "${entryPoint}" does not exist.
      Please provide an existing directory or file as your first argument (e.g. "./src")`,
    );
  } else if (!isFile(entryPoint) && !isDirectory(entryPoint)) {
    throw new Error(
      `(build-schema) invalid argument, the path "${entryPoint}" is not a directory nor a file.
      Please provide a valid directory or file path as your first argument (e.g. "./src")`,
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
      `(build-schema) invalid component name "${rootComponentName}", please provide a valid component name as your second argument (e.g. "App")`,
    );
  }

  // push the entryPoint and rootComponentName to the stack
  stack.push({
    entryPoint,
    componentName:
      rootComponentName && rootComponentName.startsWith("--")
        ? ""
        : rootComponentName,
  });

  // START TIMER
  const start = process.hrtime();

  // Start Traversing user's React files using DFS
  while (stack.length > 0) {
    const { entryPoint, componentName = "" } = stack.pop();

    // rely on this relative file path to hide the user's private file structure
    const relativeFilePath = resolveFilePath(entryPoint, componentName);
    // Guard Clause: on resolveFilePath() failure, log a warning and skip the current file
    if (!relativeFilePath) {
      if (verbosity.verbose) {
        log(
          `(build-schema) could not resolve the path "${entryPoint}" for the component "${componentName}"`,
          "warn",
        );
      }
      continue;
    }

    // if this file is marked as visited, skip it (avoids repeated parsings and infinit loop)
    // (e.g. in the case of two different files importing one another)
    if (filesVisited.has(relativeFilePath)) {
      continue;
    }
    // otherwise, mark this file as visited
    filesVisited.set(relativeFilePath, true);

    // retrieve the file's code as a string
    const code = readSourceFile(relativeFilePath);

    // GENERATE SCHEMA
    // retrieve the generated schema of this file
    const schema = parseCode(code, relativeFilePath);
    // Guard Clause: on parseCode() failure, log a warning and skip the current file
    if (!schema) {
      if (verbosity.verbose) {
        log(
          `(build-schema) failed to parse component "${componentName}" in the file "${relativeFilePath}"`,
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
    // for each of the component's descendants,
    Object.values(schema).forEach((component) => {
      component.unresolvedDescendants.forEach((unresolvedDescendant) => {
        // check if descendant is declared in the current file
        const unresolvedDescendantIsInCurrentFile =
          schema[`${unresolvedDescendant}::${relativeFilePath}`];
        // if so, set its location to the current file
        if (unresolvedDescendantIsInCurrentFile) {
          component["descendants"]?.set(unresolvedDescendant, {
            location: { filepath: relativeFilePath },
          });
          return;
        }
        // otherwise,
        // collect the descendant's import path
        // and importedName i.e. ComponentA as A if relevant
        const { importSource: descendantImportPath, importedName } =
          parseImport(code, unresolvedDescendant);
        // remember imported Names when relevant, to resolve them later
        if (importedName && unresolvedDescendant !== importedName) {
          importedNames.push({
            importedName,
            filepath: `${descendantImportPath}::${importedName}`,
            unresolvedDescendant,
          });
        }
        // if this import path was not resolved before,
        if (
          !importResolutions.has(
            `${descendantImportPath}::${unresolvedDescendant}`,
          )
        ) {
          if (verbosity.verbose) {
            log(
              `(build-schema) planning to visit import path "${descendantImportPath}" to resolve "${unresolvedDescendant}"`,
            );
          }
          // then resolve it as an absolute file path
          // case 1) import {ComponentA as A} where A is recorded
          if (
            importedName &&
            unresolvedDescendant !== importedName &&
            importResolutions.has(`${descendantImportPath}::${importedName}`)
          ) {
            // When importedName is relevant,
            // AND NOT {ComponentA} (in {ComponentA}, unresolvedDescendant = importedName)
            // AND we've resolved this import path before
            // Derive the resolution from our list of resolutions
            const resolvedImport_AbsoluteFilePath = importResolutions.get(
              `${descendantImportPath}::${importedName}`,
            );
            // Then record ComponentA's resolution path
            // (thus mapping the resolution of A to be the same as resolution of ComponentA)
            importResolutions.set(
              `${descendantImportPath}::${unresolvedDescendant}`,
              resolvedImport_AbsoluteFilePath,
            );
          } else {
            // case 2) when importedName is not relevant,
            // resolve import normally
            // NOTE resolveComponent might return a node_modules path (because of case 4 in resolveImport)
            const resolvedImport_AbsoluteFilePath = resolveComponent(
              unresolvedDescendant,
              path.resolve(process.cwd(), relativeFilePath),
              descendantImportPath,
            );

            // then record resolution path
            importResolutions.set(
              `${descendantImportPath}::${unresolvedDescendant}`,
              resolvedImport_AbsoluteFilePath,
            );
          }
        }

        // transform absolute file path to a relative file path
        const resolvedImport_RelativeFilePath = getRelativeFromAbsolutePath(
          importResolutions.get(
            `${descendantImportPath}::${unresolvedDescendant}`,
          ),
        );

        // Guard Clause: if the import statement of this descendant is missing/invalid, log a warning and skip this descendant
        if (!descendantImportPath) {
          warnings.push(
            `WARNING: (build-schema) the descendant "${unresolvedDescendant}" of component "${componentName}" could not be resolved within the file "${relativeFilePath}"`,
          );
        } else if (
          resolvedImport_RelativeFilePath &&
          resolvedImport_RelativeFilePath.includes("node_modules")
        ) {
          // Guard Clause: if the import statement of this descendant leads to a node_modules file
          // BREAKING CHANGE, file path will be set to descendantImportPath
          // e.g. TooltipPrimitive::@radix-ui/react-tooltip
          component.descendants?.set(unresolvedDescendant, {
            location: { filepath: descendantImportPath },
          });
          // add path to node_modules
          node_modules.push({ unresolvedDescendant, descendantImportPath });
        } else {
          // update component's descendant's file path
          component.descendants?.set(unresolvedDescendant, {
            location: { filepath: resolvedImport_RelativeFilePath },
          });

          // if import path is valid and file has not been resolved before,
          if (
            resolvedImport_RelativeFilePath &&
            !filesVisited.get(resolvedImport_RelativeFilePath)
          ) {
            // resolve this descendant by visiting its source file (i.e. the resolved import)
            if (verbosity.verbose) {
              log(
                `(build-schema) planning to visit "${resolvedImport_RelativeFilePath}" to resolve "${unresolvedDescendant}"`,
              );
            }
            stack.push({
              entryPoint: resolvedImport_RelativeFilePath,
              componentName: importedName ? importedName : unresolvedDescendant,
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

  // Lastly, create a duplicate component for each importedName
  // e.g. in the case of {ComponentA as A}, create A such that A = ComponentA
  importedNames.forEach(({ importedName, filepath, unresolvedDescendant }) => {
    const filepathResolution = importResolutions.get(filepath);
    const relativeResolution = getRelativeFromAbsolutePath(filepathResolution);
    components[`${unresolvedDescendant}::${relativeResolution}`] =
      components[`${importedName}::${relativeResolution}`];
  });

  // And, create a component for each node_modules file
  node_modules.forEach(({ unresolvedDescendant, descendantImportPath }) => {
    components[`${unresolvedDescendant}::${descendantImportPath}`] = {
      name: unresolvedDescendant,
      description: "",
      type: "node_module",
      descendants: [],
      internal: {
        states: [],
        functions: [],
      },
      external: {
        props: [],
        context: [],
        constants: [],
      },
      defaultExport: undefined,
      location: {
        line: undefined,
        filepath: descendantImportPath,
      },
    };
  });

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
  if (!verbosity.quiet) {
    log(
      `✅ Success: Parsed ${Object.keys(components).length} components from ${filesVisited.size} files in ${durationInMs} milliseconds`,
    );
  }

  // return schema object for optional further analysis
  return components;
}

module.exports = build_schema;
