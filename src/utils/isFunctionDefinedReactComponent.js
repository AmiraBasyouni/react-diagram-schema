// helper function: filter function-defined React declarations
const isFunctionDefinedReactComponent = (path) =>
  path.isFunctionDeclaration() &&
  // if this is not an anonymous function, the function name must follow the React component naming convention
  (path.node.id ? /^[A-Z]/.test(path.node.id.name) : true);

module.exports = isFunctionDefinedReactComponent;
