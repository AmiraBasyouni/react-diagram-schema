const isFunctionDefinedReactComponent = require("./isFunctionDefinedReactComponent");

function extract_exportFunctionDeclarationPaths(exportDeclarationPaths) {
  //EXTRACT exported function-defined REACT COMPONENTS
  const exportFunctionDeclarationPaths = exportDeclarationPaths
    .map((exportDeclaration) => exportDeclaration.get("declaration"))
    .filter(isFunctionDefinedReactComponent);

  return exportFunctionDeclarationPaths;
}

module.exports = extract_exportFunctionDeclarationPaths;
