const isInlineReactComponent = require("./isInlineReactComponent");
//const extract_exportDeclarationPaths = require("./extract_exportDeclarationPaths");

function extract_exportVariableDeclaratorPaths(exportDeclarationPaths) {
  /*// helper function: filter export declarations
  const isExportDeclaration = (path) =>
    path.isExportDefaultDeclaration || path.isExportNamedDeclaration;*/

  //EXTRACT export declarations
  //  const exportDeclarationPaths =
  //    extract_exportDeclarationPaths(program_bodyPath);

  //EXTRACT inline export declarations
  const exportVariableDeclarationPaths = exportDeclarationPaths
    .map((exportDeclaration) => exportDeclaration.get("declaration"))
    .filter(isInlineReactComponent);
  const exportVariableDeclaratorPaths = exportVariableDeclarationPaths.map(
    (declaration) => declaration.get("declarations")[0],
  );

  return exportVariableDeclaratorPaths;
}

module.exports = extract_exportVariableDeclaratorPaths;
