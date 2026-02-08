// parseFile.js

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const collectTopLevelDeclarations = require("./collectTopLevelDeclarations");

function parseFile(sourceCode) {
  /*const topLevelDeclarations = {
    imports: [],
    exports: { namedExports: [], defaultExport: [] },
    constants: [],
    functions: [],
    classes: [],
  };*/

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
      //const react_components = collectReactComponents(program_body);
      //const validated_components = validateReactComponents(react_components);
      //return extractMetadata(validated_components);

      /*const isFirstLetterCapitalized = (name) => /^[A-Z]/.test(name);

      program_body.forEach((bodyPath) => {
        switch (bodyPath.get("type")) {
          case "ImportDeclaration": {
            const specifiers = bodyPath.get("specifiers");
            specifiers.forEach((specifier) =>
              topLevelDeclarations.imports.push(specifier),
            );
            break;
          }
          case "ExportNamedDeclaration": {
            topLevelDeclarations.exports.namedExports.push(
              bodyPath.get("declaration"),
            );
            break;
          }
          case "ExportDefaultDeclaration": {
            topLevelDeclarations.exports.defaultExport.push(
              bodyPath.get("declaration"),
            );
            break;
          }
          case "VariableDeclaration": {
            const kind = bodyPath.get("kind");
            const declarators = bodyPath.get("declarations");
            switch (kind) {
              case "const": {
                declarators.forEach((declarator) => {
                  const init = declarator.get("init");
                  if (isFirstLetterCapitalized(declarator.get("name"))) {
                    const init_type = init.get("type");
                    switch (init.get("type")) {
                      case "ArrowFunctionExpression": {
                        const body = init.get("body");
                        // body_type: BlockStatement, CallExpression, or JSXElement
                        topLevelDeclarations.constants.push({
                          init_type,
                          body_type: body.get("type"),
                          declarator,
                        });
                        break;
                      }
                      case "Identifier": {
                        topLevelDeclarations.constants.push({
                          init_type,
                          declarator,
                        });
                        break;
                      }
                    }
                  }
                });
              }
            }
            break;
          }
          case "FunctionDeclaration": {
            if (isFirstLetterCapitalized(bodyPath.get("id").get("name")))
              topLevelDeclarations.functions.push(bodyPath);
            break;
          }
          case "ClassDeclaration": {
            if (isFirstLetterCapitalized(bodyPath.get("id").get("name")))
              topLevelDeclarations.classes.push(bodyPath);
            break;
          }
        }
      });*/
    },
  });

  return topLevelDeclarations;
}

module.exports = parseFile;
