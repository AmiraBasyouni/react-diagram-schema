function handleProviders(declarators, filepath) {
  const providers = [];
  const inits = declarators.map((decl) => decl.get("init"));
  inits.forEach((init) => {
    if (init.isMemberExpression() && init.node.property?.name === "Provider") {
      providers.push({
        name: init.node.property.name,
        provider: true,
        context: init.node.object.name,
        location: { line: init.node.loc.start.line, filepath },
        unresolvedDescendants: [],
      });
    }
  });
  return providers;
}

module.exports = handleProviders;
