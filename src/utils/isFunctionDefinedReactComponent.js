// helper function: filter function-defined React declarations
const isFunctionDefinedReactComponent = (path) =>
  path.isFunctionDeclaration() && /^[A-Z]/.test(path.node.id.name);

module.exports = isFunctionDefinedReactComponent;
