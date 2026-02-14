// parseFile.js

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const collectTopLevelDeclarations = require("./collectTopLevelDeclarations");

function parseFile(sourceCode) {
  const ast = parser.parse(sourceCode, {
    plugins: ["jsx", "typescript"],
    sourceType: "module",
  });

  let topLevelDeclarations;
  traverse(ast, {
    // The top-level node of the AST is always a program node,
    // there is one program node per file
    Program(programPath) {
      const program_body = programPath.get("body");
      topLevelDeclarations = collectTopLevelDeclarations(program_body);
    },
  });

  return topLevelDeclarations;
}

module.exports = parseFile;
