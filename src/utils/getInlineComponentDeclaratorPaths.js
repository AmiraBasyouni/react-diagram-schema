// getInlineComponentDeclaratorPaths.js

function getInlineComponentDeclaratorPaths(program_bodyPath) {
  // 1) helper function: filter variable declarations to select React inline declared React components
  const isInlineReactComponent = (path) => {
    // WARNING: .get() is eager — it can be called before && can decide to skip it.
    if (!path.isVariableDeclaration()) {
      return false;
    }
    // this structure ensures that the "type" property is checked only when the previous condition is true
    return (
      path.get("declarations")[0]?.node.init.type ===
        "ArrowFunctionExpression" &&
      /^[A-Z]/.test(path.get("declarations")[0].node.id.name)
    );
  };
  //EXTRACT inline REACT-COMPONENTS
  /* 2) extract inline React components */
  const inlineComponentDeclarationPaths = program_bodyPath.filter(
    isInlineReactComponent,
  );
  return inlineComponentDeclarationPaths.map(
    (declaration) => declaration.get("declarations")[0],
  );
}

module.exports = getInlineComponentDeclaratorPaths;
