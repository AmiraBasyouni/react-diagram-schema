// parseImport.js
// given an array of import specifiers and a descendant's name,
// return the descendant's importSource & importedName

function parseImport(importSpecifiers, descendantName) {
  for (const {
    specifier_type,
    specifier,
    source: importSource,
  } of importSpecifiers) {
    const localName = specifier.node.local.name;
    const importedName = specifier.node.imported?.name;
    // case1: import ComponentA from './ComponentA'
    // case2: import * as ComponentB from './file/path'
    switch (specifier_type) {
      case "ImportNamespaceSpecifier":
      case "ImportDefaultSpecifier": {
        if (localName === descendantName) {
          return { importSource, localName };
        }
        break;
      }
      case "ImportSpecifier": {
        // case3: import {ComponentA} from './ComponentA'
        // case4: import {ComponentA as A} from './ComponentA'
        if (localName === descendantName) {
          return { importSource, localName, importedName };
        }
        break;
      }
    }
  }
  // if no case was matched, return empty
  return {};
}

module.exports = parseImport;
