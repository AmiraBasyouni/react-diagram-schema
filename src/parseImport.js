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
    // case1: 'import ComponentA from './ComponentA'
    switch (specifier_type) {
      case "ImportDefaultSpecifier": {
        if (localName === descendantName) {
          return { importSource, localName };
        }
        break;
      }
      case "ImportSpecifier": {
        // case2: 'import {ComponentA} from './ComponentA'
        // case3: 'import {ComponentA as A} from './ComponentA'
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
