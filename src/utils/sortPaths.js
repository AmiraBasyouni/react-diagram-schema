// utils/sortPaths.js

// DECISION TREE
function sortPaths(program_bodyPath) {
  const variableDeclaratorPaths = [];
  const reactVariableDeclaratorPaths = [];
  const reactFunctionDeclarationPaths = [];
  const reactDefaultExportDeclarationPaths = [];
  const reactAnonymousDeclarationPaths = [];
  const reactClassDeclarationPaths = [];

  program_bodyPath.map((path) => {
    // Extract export (default and named) declarations
    const declaration = isExportDeclaration(path)
      ? path.get("declaration")
      : path;

    // Extract variable declarators
    if (declaration.isVariableDeclaration()) {
      const declarator = declaration.get("declarations")[0];
      // skip uninitialized variables (e.g. var name)
      if (isInitialized(declarator) && isCamelCased(declarator)) {
        if (isInlineReactComponent(declarator)) {
          reactVariableDeclaratorPaths.push(declarator);
        } else {
          variableDeclaratorPaths.push(declarator);
        }
      }
    }

    // Extract function declarations and default declarations
    if (declaration.isFunctionDeclaration()) {
      // if this is not an anonymous function, the function name must follow the React component naming convention
      if (
        !isAnonymousDeclaration(declaration) ? isCamelCased(declaration) : true
      ) {
        if (path.isExportDefaultDeclaration()) {
          reactDefaultExportDeclarationPaths.push(declaration);
        } else if (isAnonymousDeclaration(declaration)) {
          reactAnonymousDeclarationPaths.push(declaration);
        } else {
          reactFunctionDeclarationPaths.push(declaration);
        }
      }
    }

    // Extract AnonymousDeclarations
    if (
      declaration.isArrowFunctionExpression() &&
      path.isExportDefaultDeclaration()
    ) {
      reactAnonymousDeclarationPaths.push(declaration);
    }

    // Extract react Class Declarations
    if (declaration.isClassDeclaration()) {
      if (
        declaration.node.superClass.object.name === "React" &&
        (declaration.node.superClass.property.name === "Component" ||
          declaration.node.superClass.property.name === "PureComponent")
      ) {
        reactClassDeclarationPaths.push(declaration);
      }
    }
  });

  return {
    variableDeclaratorPaths,
    reactVariableDeclaratorPaths,
    reactFunctionDeclarationPaths,
    reactDefaultExportDeclarationPaths,
    reactAnonymousDeclarationPaths,
    reactClassDeclarationPaths,
  };
}

// ---------------------------------------------------------------------
const isInitialized = (declarator) => Boolean(declarator.node.init);

// ---------------------------------------------------------------------
const isExportDeclaration = (path) =>
  path.isExportDefaultDeclaration() || path.isExportNamedDeclaration();

// ---------------------------------------------------------------------
const isAnonymousDeclaration = (declaration) => Boolean(!declaration.node.id);

// ---------------------------------------------------------------------
const isCamelCased = (declarator) =>
  /^[A-Z]/.test(declarator.node.id?.name) &&
  !declarator.node.id?.name.includes("_");

// ---------------------------------------------------------------------
const isInlineReactComponent = (declarator) => {
  // Case 1) variable holds a function
  const isFunction =
    declarator?.node.init.type === "ArrowFunctionExpression" ||
    declarator?.node.init.type === "FunctionExpression";

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
    isForwardRef(declarator) && isFunctionInsideRef(declarator);

  //const isCamelCased = /^[A-Z]/.test(declarator.node.id.name);

  return isFunction || isForwardRefReceivingFunction;
};

module.exports = sortPaths;
