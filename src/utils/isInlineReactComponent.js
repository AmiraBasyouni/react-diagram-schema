// getInlineComponentDeclaratorPaths.js

function isInlineReactComponent(program_bodyPath) {
  // 1) helper function: filter variable declarations to select React inline declared React components
  const isInlineReactComponent = (path) => {
    // WARNING: .get() is eager — it can be called before &&. Thus, conditional statements won't be resolved in the expected order.
    // by separating the conditions with an if statement,
    // we ensure that the "type" property is checked only when the previous condition is true

    // EARLY RETURN when this path is not a variable declaration
    if (!path.isVariableDeclaration()) {
      return false;
    }

    const inlineDeclaration = path.get("declarations")[0];

    // EARLY RETURN when it's an uninitialized variable (i.e. var name;)
    if (!inlineDeclaration?.node.init) {
      return false;
    }

    // Case 1) variable holds a function
    const isFunction =
      inlineDeclaration?.node.init.type === "ArrowFunctionExpression" ||
      inlineDeclaration?.node.init.type === "FunctionExpression";

    // Case 2 Part A)  variable holds forwardRef() or React.forwardRef()
    const isForwardRef = (path) =>
      path?.node.init.type === "CallExpression" &&
      (path?.node.init.callee.name === "forwardRef" ||
        path?.node.init.callee.property?.name === "forwardRef");

    // Case 2 Part B) forwardRef is wrapped around a function, i.e. forwardRef( this is a function );
    const isFunctionInsideRef = (path) =>
      path?.node.init.arguments[0].type === "ArrowFunctionExpression" ||
      path?.node.init.arguments[0].type === "FunctionExpression";

    // Case 2 Part A&B)
    const isForwardRefReceivingFunction =
      isForwardRef(inlineDeclaration) && isFunctionInsideRef(inlineDeclaration);

    const isCamelCased = /^[A-Z]/.test(inlineDeclaration.node.id.name);

    return (isFunction || isForwardRefReceivingFunction) && isCamelCased;
  };
  return isInlineReactComponent(program_bodyPath);
}

module.exports = isInlineReactComponent;
