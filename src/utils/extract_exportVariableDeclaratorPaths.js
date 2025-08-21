const isInlineReactComponent = require("./isInlineReactComponent");
//const extract_exportDeclarationPaths = require("./extract_exportDeclarationPaths");

function extract_exportVariableDeclaratorPaths(exportDeclarationPaths) {
  //EXTRACT inline export declarations
  const exportVariableDeclarationPaths = exportDeclarationPaths
    .map((exportDeclaration) => exportDeclaration.get("declaration"))
    .filter((p) => isInlineReactComponent(p));

  const exportVariableDeclaratorPaths = exportVariableDeclarationPaths.map(
    (declaration) => declaration.get("declarations")[0],
  );

  return exportVariableDeclaratorPaths;
}

module.exports = extract_exportVariableDeclaratorPaths;
