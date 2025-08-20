// getInlineComponentDeclaratorPaths.js

function isInlineReactComponent(program_bodyPath) {
  // 1) helper function: filter variable declarations to select React inline declared React components
  const isInlineReactComponent = (path) => {
    // WARNING: .get() is eager — it can be called before &&. Thus, conditional statements won't be resolved in the expected order.
    if (!path.isVariableDeclaration()) {
      return false;
    }
    // by separating the conditions with an if statement,
    // we ensure that the "type" property is checked only when the previous condition is true
    const inlineDeclaration = path.get("declarations")[0];

    return (
      (inlineDeclaration?.node.init.type === "ArrowFunctionExpression" ||
        (inlineDeclaration?.node.init.type === "CallExpression" &&
          inlineDeclaration?.node.init.callee.name === "forwardRef" &&
          inlineDeclaration?.node.init.arguments[0].type ===
            "ArrowFunctionExpression")) &&
      /^[A-Z]/.test(inlineDeclaration.node.id.name)
    );
  };
  return isInlineReactComponent(program_bodyPath);
  /*
  //EXTRACT inline REACT-COMPONENTS
  // 2) extract inline React components 
  const inlineComponentDeclarationPaths = program_bodyPath.filter(
    isInlineReactComponent,
  );
  return inlineComponentDeclarationPaths.map(
    (declaration) => declaration.get("declarations")[0],
  );*/
}

module.exports = isInlineReactComponent;
