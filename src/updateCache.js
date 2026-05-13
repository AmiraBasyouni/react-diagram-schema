const parseImport = require("./parseImport");
const resolveComponent = require("./resolveComponent");
const path = require("path");
const log = require("./log");

function updateCache({
  imports,
  unresolvedDescendant,
  relativeFilePath,
  cache,
  verbosity,
}) {
  const { importedNames, importResolutions } = cache;
  // definition:
  // importSource => "./relative/file"
  // localName => `import localName`
  // localName && importedName => `import {local}`, `import {imported}`, `import {imported as local}`
  const { importSource, localName, importedName } = parseImport(
    imports,
    unresolvedDescendant,
  );

  // importedName (fallback to localName)
  const importName = importedName ? importedName : localName;
  // Note: do not check importedName == localName lest localName turns out undefined

  // if import { A as B } from "./fake/file/A",
  // then remember that B = A
  if (importName && unresolvedDescendant !== importName) {
    importedNames.push({
      importName,
      filepath: `${importSource}::${importName}`,
      unresolvedDescendant,
    });
  }

  // if path of B was not resolved before,
  if (!importResolutions.has(`${importSource}::${unresolvedDescendant}`)) {
    if (verbosity.verbose) {
      log(
        `(build-schema) planning to visit import path "${importSource}" to resolve "${unresolvedDescendant}"`,
      );
    }
    // case 1) import {A as B} where "./fake/file/A" was resolved before
    if (
      importName &&
      unresolvedDescendant !== importName &&
      importResolutions.has(`${importSource}::${importName}`)
    ) {
      // Look up A's resolution
      const resolvedImport_AbsoluteFilePath = importResolutions.get(
        `${importSource}::${importName}`,
      );
      // Then record B
      // B = A therefore (B => "./fake/file/A")
      importResolutions.set(
        `${importSource}::${unresolvedDescendant}`,
        resolvedImport_AbsoluteFilePath,
      );
    } else {
      // case 2) resolve all other cases normally
      // NOTE resolveComponent might return a node_modules path (because of case 4 in resolveImport)
      const resolvedImport_AbsoluteFilePath = resolveComponent(
        unresolvedDescendant,
        path.resolve(process.cwd(), relativeFilePath),
        importSource,
      );
      // then record resolution path
      importResolutions.set(
        `${importSource}::${unresolvedDescendant}`,
        resolvedImport_AbsoluteFilePath,
      );
    }
  }

  return { importName, importSource };
}

module.exports = updateCache;
