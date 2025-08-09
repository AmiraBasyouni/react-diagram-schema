function extract_exportDeclarationPaths(program_bodyPath) {
  // helper function: filter export declarations
  const isExportDeclaration = (path) =>
    path.isExportDefaultDeclaration || path.isExportNamedDeclaration;

  //EXTRACT export declarations
  const exportDeclarationPaths = program_bodyPath.filter(isExportDeclaration);
  return exportDeclarationPaths;
}

module.exports = extract_exportDeclarationPaths;
