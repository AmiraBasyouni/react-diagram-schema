/* (build-schema.js) Traverses all files starting from entry point to build full schema structure */

// imports
const getParsedCode = require("./getParsedCode");
const getComponents = require("./getComponents");
const getRelativeFilePath = require("./getRelativeFilePath");
const getCode = require("./getCode");
const { isFile, isDirectory, pathExists } = require("./utils/isFile");
const getRelativeFromAbsolutePath = require("./utils/getRelativeFromAbsolutePath");
const getAlias = require("./utils/getAlias");
const updateCache = require("./updateCache");
const log = require("./log");

// INITIALIZING VARIABLES
// warnings: an array to collect warnings related to insufficient data
// componentsByUID: an object to store the schema
// filesVisited: a Map to prevent multiple visits to the same file
// importResolutions: a Map to prevent multiple resolutions for the same import path
// stack: an array to organize visiting logic
const warnings = [];
const componentsByUID = {};
const filesVisited = new Map();
const importResolutions = new Map();
const stack = [];
const importedNames = [];
const node_modules = [];
const unresolvedComponents = [];

// build_schema
// 1. accepts <entryDirectory|entryFile> and [rootComponentName] and verbosity levels
//    Note: verbosity is retrieved from CLI logic {quiet: boolean, verbose: boolean, debug: boolean }
// 2. validates inputs <entryDirectory|entryFile> and [rootComponentName]
// 3. push the inputs to the stack
// 4. traverse user's project files using DFS
function build_schema(entryPoint, rootComponentName, verbosity = {}) {
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
    const relativeFilePath = getRelativeFilePath(entryPoint, componentName);
    // Guard Clause: on getRelativeFilePath() failure, log a warning and skip the current file
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
    // otherwise, mark this file as visited before proceeding
    filesVisited.set(relativeFilePath, true);

    // retrieve the file's code as a string
    const code = getCode(relativeFilePath);

    // GET COMPONENTS
    const parsedCode = getParsedCode(code);
    const components = getComponents(parsedCode, relativeFilePath);
    // Guard Clause: on getComponents() failure, log a warning and skip the current file
    if (!components) {
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
    Object.values(components).forEach((component) => {
      const alias = getAlias(parsedCode.assignmentExpressions, component.name);
      // UID for default exported component is the component's imported name
      if (component.defaultExport) {
        componentsByUID[`${componentName}::${relativeFilePath}`] = component;
        // UID for imported components that have an alias uses alias when available
      } else if (alias) {
        componentsByUID[`${alias}::${relativeFilePath}`] = component;
        // UID for all other components uses the assigned name of that component
      } else {
        componentsByUID[`${component.name}::${relativeFilePath}`] = component;
      }
      // if this is the first parsed component
      if (Object.keys(componentsByUID).length === 1) {
        // mark it as the entry component
        componentsByUID[Object.keys(componentsByUID)[0]]["isEntryComponent"] =
          true;
      }
    });

    // if we received a valid componentName and it has not been resolved before,
    if (componentName && !components[`${componentName}::${relativeFilePath}`]) {
      // add it to our unresolved pile
      unresolvedComponents.push({
        componentName,
        ID: `${componentName}::${relativeFilePath}`,
      });
    }

    // UNRESOLVED DESCENDANTS
    // for each of the component's descendants,
    Object.values(components).forEach((component) => {
      // filepath_unresolvedDescendant, unresolvedDescendant
      component.unresolvedDescendants.forEach((fp, unresolvedDescendant) => {
        const cache = { importedNames, importResolutions };
        const imports = parsedCode.imports;
        // collect the descendant's import path
        const { importName, importSource } = updateCache({
          imports,
          unresolvedDescendant,
          relativeFilePath,
          cache,
          verbosity,
        });

        // transform absolute file path to a relative file path
        const resolvedImport_RelativeFilePath = getRelativeFromAbsolutePath(
          importResolutions.get(`${importSource}::${unresolvedDescendant}`),
        );

        // Guard Clause: if the import statement of this descendant is missing/invalid, log a warning and skip this descendant
        if (!importSource) {
          warnings.push(
            `WARNING: (build-schema) the descendant "${unresolvedDescendant}" of component "${componentName}" could not be resolved within the file "${relativeFilePath}"`,
          );
        } else if (
          resolvedImport_RelativeFilePath &&
          resolvedImport_RelativeFilePath.includes("node_modules")
        ) {
          // Guard Clause: if the import statement of this descendant leads to a node_modules file
          // file path will be set to descendant's import path
          // e.g. TooltipPrimitive::@radix-ui/react-tooltip
          component.unresolvedDescendants.set(
            unresolvedDescendant,
            importSource,
          );
          // add path to node_modules
          node_modules.push({ unresolvedDescendant, importSource });
        } else {
          // update component's descendant's file path
          component.unresolvedDescendants.set(
            unresolvedDescendant,
            resolvedImport_RelativeFilePath,
          );
          // if file has already been visited,
          if (filesVisited.get(resolvedImport_RelativeFilePath)) {
            // resolve remaining unresolved descendants
            unresolvedComponents.push({
              componentName: unresolvedDescendant,
              ID: `${unresolvedDescendant}::${resolvedImport_RelativeFilePath}`,
            });
          }

          // if import path is valid and file has not been visited yet,
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
              componentName: importName ? importName : unresolvedDescendant,
            });
          }
        }
      }); // end of component.unresolvedDescendants.forEach((fp, unresolvedDescendant) => {

      // transform component descendants from type Map to type Array
      component.descendants = Array.from(
        component.unresolvedDescendants.entries(),
      ).map(([name, filepath]) => `${name}::${filepath}`);
      // clear and hide unresolvedDescendants from JSON file output
      component.unresolvedDescendants = undefined;
    }); // end of Object.values(components).forEach((component) => {
  } // end of while loop

  // Lastly, create a duplicate component for each importedName
  // e.g. in the case of {ComponentA as A}, create A such that A = ComponentA
  importedNames.forEach(({ importName, filepath, unresolvedDescendant }) => {
    const filepathResolution = importResolutions.get(filepath);
    const relativeResolution = getRelativeFromAbsolutePath(filepathResolution);
    componentsByUID[`${unresolvedDescendant}::${relativeResolution}`] =
      componentsByUID[`${importName}::${relativeResolution}`];
  });

  // And, create a component for each node_modules file
  node_modules.forEach(({ unresolvedDescendant, importSource }) => {
    componentsByUID[`${unresolvedDescendant}::${importSource}`] = {
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
        filepath: importSource,
      },
    };
  });

  // And ammend unresolved components
  unresolvedComponents.forEach(({ componentName, ID }) => {
    if (!componentsByUID[ID]) {
      const obj = {
        name: `${componentName}`,
        description: "",
        descendants: [],
        internal: { states: [], functions: [] },
        external: { props: [], context: [], constants: [] },
        defaultExport: undefined,
        location: null,
        unresolvedDescendants: undefined,
        unresolved: true,
      };
      componentsByUID[ID] = obj;
      //console.log(`appended ${componentName} to schema as ${ID}`);
    }
  });

  // END TIMER
  const end = process.hrtime(start); // Calculates difference from start
  // durationInMs: stores the time it took to parse all of the user's React source code
  const durationInMs = end[0] * 1000 + end[1] / 1000000;

  // log schema to the console for quick visual analysis
  if (verbosity.debug) {
    console.dir(componentsByUID, { depth: null, colors: true });
  }
  // log collected warnings
  if (verbosity.verbose || verbosity.debug) {
    warnings.forEach((warning) => console.warn(warning));
  }

  // log success message since we have completed the parsing and schema generation process
  if (!verbosity.quiet) {
    log(
      `✅ Success: Parsed ${Object.keys(componentsByUID).length} components from ${filesVisited.size} files in ${durationInMs} milliseconds`,
    );
  }

  // return schema object for optional further analysis
  return componentsByUID;
}

module.exports = build_schema;
