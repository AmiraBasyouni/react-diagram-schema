/* (parseImport.js) Objective: given a code string and a descendant's name, return the descendant's relative import path */

/* imports */
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/* fulfilling objective using AST traversal */
function parseImport(code, descendantName) {
  let returnValue = "";

  /* create an AST using @babel/parser */
  const ast = parser.parse(code, {
    plugins: ["jsx", "typescript"],
    sourceType: "module",
  });

  /* traverse the AST using @babel/traverse */
  traverse(ast, {
    /* Note: In every parsed file, the top-level node of the AST is always a program node */
    /* Note: There is only one program per file */
    /* traverse the program node */
    Program(path) {
      const program_bodyPath = path.get("body");
      /* collect all top-level import statements */
      const importStatement_paths = program_bodyPath.filter((path) =>
        path.isImportDeclaration(),
      );
      const ourImportStatement_array = importStatement_paths.filter(
        (importStatement_path) => {
          return importStatement_path
            .get("specifiers")
            .some((specifier_path) => {
              /* case1: 'import ComponentA from './ComponentA' */
              if (specifier_path.isImportDefaultSpecifier) {
                return specifier_path.get("local").node.name === descendantName;
              }
              /* case2: 'import {ComponentA} from './ComponentA'*/
              if (specifier_path.isImportSpecifier) {
                return specifier_path.get("local").node.name === descendantName;
              }
              return false;
            });
        },
      );

      /* if we found an import that matches our descendant's name, */
      if (ourImportStatement_array.length > 0) {
        const importSource =
          ourImportStatement_array[0].get("source").node.value;
        importSource.startsWith("./") || importSource.startsWith("../")
          ? (returnValue = importSource)
          : (returnValue = null);
        //returnValue = ourImportStatement_array[0].get("source").node.value;
      } else {
        returnValue = null;
      }
    },
  });
  return returnValue;
}

module.exports = parseImport;
