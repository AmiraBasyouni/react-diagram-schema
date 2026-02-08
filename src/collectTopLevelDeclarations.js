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
          const specifiers = bodyPath.get("specifiers");
          specifiers.forEach((specifier) => {
            const specifier_type = specifier.node.type;
            switch (specifier.node.type) {
              case "ImportDefaultSpecifier": {
                topLevelDeclarations.imports.push({
                  specifier_type,
                  specifier,
                });
                break;
              }
              case "ImportSpecifier": {
                topLevelDeclarations.imports.push({
                  specifier_type,
                  specifier,
                });
                break;
              }
            }
          });
          break;
        }
        // stores declarations
        case "ExportNamedDeclaration": {
          topLevelDeclarations.exports.push({
            export_type: "named",
            declaration: bodyPath.get("declaration"),
          });
          //parseDeclarations(bodyPath.get("declaration"));
          break;
        }
        // stores declarations
        case "ExportDefaultDeclaration": {
          topLevelDeclarations.exports.push({
            export_type: "default",
            declaration: bodyPath.get("declaration"),
          });
          break;
        }
        // stores declarators
        case "VariableDeclaration": {
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
                    case "CallExpression": {
                      topLevelDeclarations.constants.push({
                        init_type,
                        declarator,
                      });
                    }
                  }
                } else {
                  topLevelDeclarations.regular_constants.push({
                    init_type,
                    declarator,
                  });
                }
              });
            }
          }
          break;
        }
        // stores function declarations
        case "FunctionDeclaration": {
          if (isFirstLetterCapitalized(bodyPath.get("id").node.name)) {
            topLevelDeclarations.functions.push({ declaration: bodyPath });
          } else {
            topLevelDeclarations.regular_functions.push(bodyPath);
          }
          break;
        }
        // stores class declarations
        case "ClassDeclaration": {
          if (isFirstLetterCapitalized(bodyPath.get("id").node.name))
            topLevelDeclarations.classes.push(bodyPath);
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
