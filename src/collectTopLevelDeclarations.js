// collectTopLevelDeclarations.js

function collectTopLevelDeclarations(program_body) {
  const topLevelDeclarations = {
    imports: [],
    exports: [],
    constants: [],
    regular_constants: [],
    functions: [],
    regular_functions: [],
    classes: [],
    returnStatement: [],
  };

  const isFirstLetterCapitalized = (name) => /^[A-Z]/.test(name);

  parseDeclarations(program_body);
  function parseDeclarations(body) {
    body.forEach((bodyPath) => {
      switch (bodyPath.node.type) {
        // stores specifiers
        case "ImportDeclaration": {
          const source = bodyPath.get("source").node.value;
          const specifiers = bodyPath.get("specifiers");
          specifiers.forEach((specifier) => {
            const specifier_type = specifier.node.type;
            switch (specifier.node.type) {
              case "ImportDefaultSpecifier": {
                topLevelDeclarations.imports.push({
                  specifier_type,
                  specifier,
                  source,
                });
                break;
              }
              case "ImportSpecifier": {
                topLevelDeclarations.imports.push({
                  specifier_type,
                  specifier,
                  source,
                });
                break;
              }
            }
          });
          break;
        }
        // stores declarations
        case "ExportNamedDeclaration": {
          const exportDeclaration = bodyPath.get("declaration");
          // if (declaration: null) then skip this pass
          if (!exportDeclaration.node) break;
          const declaration_type = exportDeclaration.node.type;
          topLevelDeclarations.exports.push({
            export_type: "named",
            declaration: bodyPath.get("declaration"),
            declaration_type,
          });
          //parseDeclarations(bodyPath.get("declaration"));
          break;
        }
        // stores declarations
        case "ExportDefaultDeclaration": {
          const exportDeclaration = bodyPath.get("declaration");
          const declaration_type = exportDeclaration.node.type;
          topLevelDeclarations.exports.push({
            export_type: "default",
            declaration_type,
            declaration: bodyPath.get("declaration"),
          });
          break;
        }
        // stores declarators
        case "VariableDeclaration": {
          const declaration_type = "VariableDeclaration";
          const kind = bodyPath.node.kind;
          const declarators = bodyPath.get("declarations");
          switch (kind) {
            case "const": {
              declarators.forEach((declarator) => {
                const init = declarator.get("init");
                const init_type = init.node.type;
                const declarator_id_type = declarator.get("id").node.type;
                if (
                  declarator_id_type === "Identifier" &&
                  isFirstLetterCapitalized(declarator.get("id").node.name)
                ) {
                  switch (init_type) {
                    case "ArrowFunctionExpression": {
                      const body = init.get("body");
                      // body_type: BlockStatement, CallExpression, or JSXElement
                      topLevelDeclarations.constants.push({
                        init_type,
                        body_type: body.node.type,
                        declarator,
                        declaration_type,
                      });
                      break;
                    }
                    case "Identifier":
                    case "CallExpression":
                    case "JSXElement": {
                      topLevelDeclarations.constants.push({
                        init_type,
                        declarator,
                        declaration_type,
                      });
                    }
                  }
                } else {
                  topLevelDeclarations.regular_constants.push({
                    init_type,
                    declarator,
                    declaration_type,
                  });
                }
              });
            }
          }
          break;
        }
        // stores function declarations
        case "FunctionDeclaration": {
          const declaration_type = "FunctionDeclaration";
          if (isFirstLetterCapitalized(bodyPath.get("id").node.name)) {
            topLevelDeclarations.functions.push({
              declaration: bodyPath,
              declaration_type,
            });
          } else {
            topLevelDeclarations.regular_functions.push(bodyPath);
          }
          break;
        }
        // stores class declarations
        case "ClassDeclaration": {
          const declaration_type = "ClassDeclaration";
          if (isFirstLetterCapitalized(bodyPath.get("id").node.name))
            topLevelDeclarations.classes.push({
              declaration: bodyPath,
              declaration_type,
            });
          break;
        }
        // stores return statements
        case "ReturnStatement": {
          topLevelDeclarations.returnStatement.push(bodyPath);
          break;
        }
      }
    });
  }
  return topLevelDeclarations;
}

module.exports = collectTopLevelDeclarations;
