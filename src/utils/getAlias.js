//const parser = require("@babel/parser");
//const traverse = require("@babel/traverse").default;

function getAlias(assignmentExpressions, componentName) {
  // filter more to view only the displayName expression statements related to our component
  const displayNameExpressionStatementPaths = assignmentExpressions
    .map((path) => path.get("expression"))
    .filter(
      (p) =>
        p.node.left.type === "MemberExpression" &&
        p.node.left.object.name === componentName &&
        p.node.left.property.type === "Identifier" &&
        p.node.left.property.name === "displayName",
    );

  // verify that alias is a string literal, then extract alias if one exists
  const alias =
    displayNameExpressionStatementPaths[0]?.node.right.type === "StringLiteral"
      ? displayNameExpressionStatementPaths[0].node.right.value
      : "";

  return alias;
}

module.exports = getAlias;
