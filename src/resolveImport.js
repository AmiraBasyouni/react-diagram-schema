// resolveImport.js

const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");
const isFile = require("./utils/isFile");
const resolveTypeScriptPath = require("./resolveTypeScriptPath");

//
// Resolves a component import to an absolute file path.
// Uses Node resolution first, then falls back to TS/JS extensions.
//
// @param {string} importedName - Import string (e.g. './Button' or '@xyflow/react')
// @param {string} fromFile - Absolute path of the file doing the import
// @returns {string|undefined} Absolute resolved path, or undefined if not found
//
function resolveImport(fromFile, importedName) {
  // Guard against undefined inputs
  if (!fromFile || !importedName) {
    //console.warn("(resolveImport) fromFile or importedName is not defined");
    return null;
  }

  try {
    // setup
    const requireFromFile = createRequire(fromFile);

    // 1. try Node's normal resolution
    try {
      // determine the full path of a module but without actually loading or executing the module
      const resolved = requireFromFile.resolve(importedName);
      //console.log(`[resolveImport] Node resolved "${importedName}" from "${fromFile}" -> ${resolved}`);

      // 1. a) Look for a package.json for this module
      let pkgJsonPath;
      try {
        pkgJsonPath = require.resolve(`${importedName}/package.json`, {
          paths: [fromFile],
        });
      } catch {
        // Not a package, probably a relative import
        // Return the absolute path of the resolved module
        //console.log("Resolved", resolved);
        return resolved;
      }

      const pkgDir = path.dirname(pkgJsonPath);

      // 1. b) Check if this package looks like a workspace package
      // (heyristic: does it have a "src/" folder?)
      const srcDir = path.join(pkgDir, "src");

      if (fs.existsSync(srcDir)) {
        // 1. c) Prefer src/index.* over dist/umd/*
        const candidates = [
          "index.ts",
          "index.tsx",
          "index.js",
          "index.jsx",
        ].map((f) => path.join(srcDir, f));

        const srcEntry = candidates.find((f) => fs.existsSync(f));
        if (srcEntry) {
          //console.log("srcEntry", srcEntry);
          return srcEntry;
        }
      }

      /* eslint-disable no-unused-vars */
    } catch (err) {
      /* eslint-enable no-unused-vars */
      // If the module cannot be found using the resolution algorithm, require.resolve() will throw an error, just like require() would
      //console.log(
      //  `[resolveImport] Node could NOT resolve "${importedName}" from "${fromFile}". Trying tsconfig fallback...`,
      //);
    }

    // 2. try typescript's tsconfig resolution
    try {
      const resolvedDir = resolveTypeScriptPath(fromFile, importedName);
      return resolvedDir;
    } catch (err) {
      console.log(`[resolveImport] tsconfig resolution error: ${err}`);
    }

    // 3. Manual fallback: check extensions (.js, .jsx, .ts, .tsx)
    const baseDir = path.dirname(fromFile);
    const candidatePaths = [
      path.resolve(baseDir, importedName),
      path.resolve(baseDir, `${importedName}.js`),
      path.resolve(baseDir, `${importedName}.jsx`),
      path.resolve(baseDir, `${importedName}.ts`),
      path.resolve(baseDir, `${importedName}.tsx`),
      path.resolve(baseDir, importedName, "index.js"),
      path.resolve(baseDir, importedName, "index.jsx"),
      path.resolve(baseDir, importedName, "index.ts"),
      path.resolve(baseDir, importedName, "index.tsx"),
    ];

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        if (isFile(candidate)) {
          //console.log(
          //  `[resolveImport] Fallback resolved "${importedName}" from "${fromFile}" -> ${candidate}`,
          //);
          return candidate;
        }
      }
    }

    console.log(`[resolveImport] FAILED to resolve "${importedName}".`);
    return null;
  } catch (fatalErr) {
    console.error(
      `[resolveImport] Fatal error while resolving "${importedName}":`,
      fatalErr,
    );
    return null;
  }
}
module.exports = resolveImport;

/*
// Uses TypeScript compiler's resolution logic

const ts = require("typescript");
const path = require("path");

//
// Given the absolute path of the imported file and the string inside the import statement, resolve the import.
// @param {string} fromFile - the absolute path of the file doing the import.
// @param {string} importedName - the string inside the import statement (e.g., "./Button", "../utils/helpers", "react").
// @returns {string} if TypeScript successfully found the file, grab its resolvedFileName and turn it into an absolute path.
//
function resolveImport(fromFile, importedName, tsconfig = {}) {
  // Guard against undefined inputs
  if (!fromFile || !importedName) {
    //console.warn("(resolveImport) fromFile or importedName is not defined");
    return null;
  }

  // host - a set of functions the TypeScript compiler uses to read files, check existence, get directories, etc.
  const host = ts.createCompilerHost({});

  const moduleResolution = ts.resolveModuleName(
    importedName, // The import string (e.g., "./Button" or "react")
    fromFile, // The absolute file path that contains the import
    // compiler options:
    {
      moduleResolution: ts.ModuleResolutionKind.NodeNext, // Node.js-like resolution or you can use NodeNext
      jsx: ts.JsxEmit.Preserve, // Do not compile JSX
      allowJs: true, // consider .js and .jsx files alongside .ts and .tsx files during module resolution and type checking
      allowImportingTsExtensions: true,
      preserveSymlinks: false, // With this, TypeScript should follow pnpm’s symlinks properly.
      ...tsconfig,
    },
    host, // The compiler host handles file lookups
  );

  if (!moduleResolution.resolvedModule) {
    console.warn(
      `(resolveImport) moduleResolution.resolvedModule was unsuccessful from file ${fromFile} and import ${importedName}`,
    );
    //console.log(moduleResolution);
    return null;
  }
  return path.resolve(moduleResolution.resolvedModule.resolvedFileName);
}

module.exports = resolveImport;
*/
