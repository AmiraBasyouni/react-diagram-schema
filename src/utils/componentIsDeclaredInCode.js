/* (componentIsDeclaredInCode.js) objective: given a string of code and a component's name, check whether the component was declared within the given code string */

/* imports */
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/* fulfilling objective using AST traverser */
function componentIsDeclaredInCode(code, componentName) {
  let returnValue = false;
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

      /* (helper-function) filter React component declarations from a set of function declarations */
      const isReactComponent = (path) =>
        path.isFunctionDeclaration() && /^[A-Z]/.test(path.node.id.name);

      /* extract the path of component declarations */
      const componentPaths = program_bodyPath.filter(isReactComponent);

      /* for each component declaration, */
      componentPaths.forEach((componentPath) => {
        /* check if this component's name matches the name given to us as an argument (i.e. content of componentName) */
        if (componentPath.node.id.name === componentName) {
          /* if so, then we've confirmed our component's declaration exists! */
          returnValue = true;
        }
      });
    },
  });

  /* if we couldn't find our component's declaration, */
  return returnValue;
}

module.exports = componentIsDeclaredInCode;
