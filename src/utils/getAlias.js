const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function getAlias(code, componentName) {
  // initialize variable
  let alias = "";

  // create ast
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  // traverse ast
  traverse(ast, {
    // parse the Program (only one Program exists in an ast)
    Program(programPath) {
      // collect all top level expression statements inside of Program's body array
      const expressionStatementPaths = programPath
        .get("body")
        .filter((path) => path.isExpressionStatement());

      // filter to view only Assignment expression statements
      const assignmentExpressionStatementPaths =
        expressionStatementPaths.filter((path) =>
          path.get("expression").isAssignmentExpression(),
        );

      // filter more to view only the displayName expression statements related to our component
      const displayNameExpressionStatementPaths =
        assignmentExpressionStatementPaths
          .map((path) => path.get("expression"))
          .filter(
            (p) =>
              p.node.left.type === "MemberExpression" &&
              p.node.left.object.name === componentName &&
              p.node.left.property.type === "Identifier" &&
              p.node.left.property.name === "displayName",
          );

      // verify that alias is a string literal, then extract alias if one exists
      alias =
        displayNameExpressionStatementPaths[0]?.node.right.type ===
        "StringLiteral"
          ? displayNameExpressionStatementPaths[0].node.right.value
          : "";
    },
  });
  return alias;
}

module.exports = getAlias;
