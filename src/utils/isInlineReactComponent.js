// getInlineComponentDeclaratorPaths.js

function isInlineReactComponent(program_bodyPath) {
  // 1) helper function: filter variable declarations to select React inline declared React components
  const isInlineReactComponent = (path) => {
    // WARNING: .get() is eager — it can be called before &&. Thus, conditional statements won't be resolved in the expected order.
    // by separating the conditions with an if statement,
    // we ensure that the "type" property is checked only when the previous condition is true

    // if this path is not a variable declaration, early return
    if (!path.isVariableDeclaration()) {
      return false;
    }

    const inlineDeclaration = path.get("declarations")[0];

    // in the case of an uninitialized variable (i.e. var name;) early return
    if (!inlineDeclaration?.node.init) {
      return false;
    }

    return (
      (inlineDeclaration?.node.init.type === "ArrowFunctionExpression" ||
        inlineDeclaration?.node.init.type === "FunctionExpression" ||
        (inlineDeclaration?.node.init.type === "CallExpression" &&
          inlineDeclaration?.node.init.callee.name === "forwardRef" &&
          (inlineDeclaration?.node.init.arguments[0].type ===
            "ArrowFunctionExpression" ||
            inlineDeclaration?.node.init.arguments[0].type ===
              "FunctionExpression"))) &&
      /^[A-Z]/.test(inlineDeclaration.node.id.name)
    );
  };
  return isInlineReactComponent(program_bodyPath);
}

module.exports = isInlineReactComponent;
