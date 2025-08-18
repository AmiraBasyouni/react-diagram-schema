const isFunctionDefinedReactComponent = require("./isFunctionDefinedReactComponent");

function extract_exportFunctionDeclarationPaths(
  exportDeclarationPaths,
  defaultExport = false,
) {
  //EXTRACT exported function-defined REACT COMPONENTS
  const exportFunctionDeclarationPaths = (
    defaultExport
      ? exportDeclarationPaths.filter((path) =>
          path.isExportDefaultDeclaration(),
        )
      : exportDeclarationPaths.filter((path) => path.isExportNamedDeclaration())
  )
    .map((exportDeclaration) => exportDeclaration.get("declaration"))
    .filter(isFunctionDefinedReactComponent);

  return exportFunctionDeclarationPaths;
}

module.exports = extract_exportFunctionDeclarationPaths;
