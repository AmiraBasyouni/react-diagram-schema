/* (componentIsDeclaredInCode.js) objective: given a string of code and a component's name, check whether the component was declared within the given code string */

// imports
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const isInlineReactComponent = require("./isInlineReactComponent");
const isFunctionDefinedReactComponent = require("./isFunctionDefinedReactComponent");
const extract_exportDeclarationPaths = require("./extract_exportDeclarationPaths");
const extract_exportVariableDeclaratorPaths = require("./extract_exportVariableDeclaratorPaths");
const extract_exportFunctionDeclarationPaths = require("./extract_exportFunctionDeclarationPaths");

//code: string
//componentName: string
//entryComponent: boolean
function componentIsDeclaredInCode(code, componentName, isEntryComponent) {
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
      // ---- exported components -----------------------------------------------------------------
      const exportDeclarationPaths =
        extract_exportDeclarationPaths(program_bodyPath);

      if (isEntryComponent) {
        program_bodyPath.forEach((path) => {
          // check if a default export is available
          if (path.isExportDefaultDeclaration()) {
            // if so, confirm that our component's declaration exists
            returnValue = true;
          }
        });
      }

      //---- inline React components ------------------------------------------------------------------
      //EXTRACT inline REACT COMPONENTS
      const inlineComponentDeclarationPaths = program_bodyPath.filter(
        isInlineReactComponent,
      );
      const inlineComponentDeclaratorPaths =
        inlineComponentDeclarationPaths.map(
          (declaration) => declaration.get("declarations")[0],
        );

      //EXTRACT exported inline REACT COMPONENTS
      const exportVariableDeclaratorPaths =
        extract_exportVariableDeclaratorPaths(exportDeclarationPaths);

      //MERGE exports and inline REACT COMPONENTS
      exportVariableDeclaratorPaths.forEach((exportVariable) =>
        inlineComponentDeclaratorPaths.push(exportVariable),
      );

      function doesComponentDeclarationExist(componentPaths) {
        // for each component
        componentPaths.forEach((componentPath) => {
          // check if this component's name matches the name given to us as an argument (i.e. content of componentName)
          if (componentPath.node.id?.name === componentName) {
            // if so, confirm that our component's declaration exists
            returnValue = true;
          }
        });
      }
      doesComponentDeclarationExist(inlineComponentDeclaratorPaths);

      //----function-defined components ----------------------------------------------------------------------
      //EXTRACT function-defined REACT-COMPONENTS
      const functionDefinedComponentPaths = program_bodyPath.filter(
        isFunctionDefinedReactComponent,
      );

      //EXTRACT exported function-defined REACT COMPONENTS
      const exportFunctionDeclarationPaths =
        extract_exportFunctionDeclarationPaths(exportDeclarationPaths);

      //MERGE exports WITH normal function-defined declarations
      exportFunctionDeclarationPaths.forEach((exportFunction) =>
        functionDefinedComponentPaths.push(exportFunction),
      );

      doesComponentDeclarationExist(functionDefinedComponentPaths);
    },
  });

  // if we couldn't find our component's declaration,
  return returnValue;
}

module.exports = componentIsDeclaredInCode;
