// verifyReactComponents.js
// goals:
// - indicator 1: a component must start with a capital letter (verified in parseFile())
// - indicator 2: a component must either return JSX, contain a hook, be nested in a component factory, or come as class extends React
// - test refactor on the html-input repo
// - achieve:
//   --> better code readability,
//   --> don't consider `const anArray = []` as a component,
//   --> continue to consider `const Component = as`

const parseDeclarations = require("./collectTopLevelDeclarations");

function verifyReactComponents(topLevelDeclarations) {
  // indicator 2: is at least one of these true?
  // returnsJSXElement || isNestedInComponentFactory || isClassExtendsReact || containsHook
  const verified = verify(topLevelDeclarations);

  const verifiedComponents = [
    ...verified.constants,
    ...verified.functions,
    ...verified.classes,
    ...verified.exports,
  ];
  return verifiedComponents;
}

/*
  const isReactComponent = (path) =>
  returnsJSXElement(path) ||
  isNestedInComponentFactory(path) ||
  isClassExtendsReact(path) || 
  containsHook(path);
*/

function verify({
  constants: tentativeConstants,
  functions: tentativeFunctions,
  classes: tentativeClasses,
  exports: tentativeExports,
}) {
  const constants = [];
  const functions = [];
  const classes = [];
  const exports = [];

  tentativeConstants.map(
    ({
      export_type,
      init_type,
      body_type,
      declarator,
      declaration_type,
      verified = new Set(),
    }) => {
      switch (init_type) {
        case "ArrowFunctionExpression": {
          // case: const Component = () => <div></div>;
          // case: const Component = () => { return <div></div> }
          const returnsJSX = returnsJSXElement({
            export_type,
            init_type,
            body_type,
            declarator,
            declaration_type,
            verified,
          });
          if (returnsJSX) {
            constants.push(returnsJSX);
          }
          break;
        } // End of ArrowFunctionExpression
        // case: const Component = memo(() => {}) or forwardref(() => {})
        case "CallExpression": {
          const declaratorInComponentFactory = isNestedInComponentFactory({
            export_type,
            init_type,
            declarator,
            declaration_type,
            verified,
          });
          if (declaratorInComponentFactory) {
            constants.push(declaratorInComponentFactory);
          }
          break;
        }
        // case: const Component = <div></div>
        case "JSXElement": {
          verified.add("returns JSXElement");
          constants.push({
            export_type,
            declaration_type,
            init_type,
            declarator,
            verified,
          });
          break;
        }
        // case: const Component = as where `as` is derived from props
        case "Identifier": {
          break;
        }
      } // End of switch(init_type)
    },
  );

  tentativeFunctions.map(
    ({ export_type, declaration, declaration_type, verified = new Set() }) => {
      // case: function Component() { return <div></div> }
      const returnsJSX = returnsJSXElement({
        export_type,
        declaration,
        declaration_type,
        verified,
      });
      if (returnsJSX) {
        functions.push(returnsJSX);
      }
    },
  );

  tentativeExports.map(
    ({ export_type, declaration, declaration_type, verified = new Set() }) => {
      switch (export_type) {
        case "default": {
          switch (declaration_type) {
            case "ArrowFunctionExpression": {
              // case: export default () => { return <JSX/> }
              // and export default () => <JSX/>
              const returnsJSX = returnsJSXElement({
                export_type,
                init_type: "ArrowFunctionExpression",
                body_type: declaration.get("body").node.type,
                declaration,
                declaration_type,
                verified,
              });
              if (returnsJSX) {
                exports.push(returnsJSX);
              }
              break;
            }
            // case: export default forwardRef(() => {})
            case "CallExpression": {
              const declaratorInComponentFactory = isNestedInComponentFactory({
                export_type,
                init_type: "CallExpression",
                declaration,
                declaration_type,
                verified,
              });
              if (declaratorInComponentFactory) {
                exports.push(declaratorInComponentFactory);
              }
              break;
            }
            // case: export default function MyFunction() {}
            case "FunctionDeclaration": {
              // case: function Component() { return <div></div> }
              const returnsJSX = returnsJSXElement({
                export_type,
                declaration,
                declaration_type,
                verified,
              });
              if (returnsJSX) {
                exports.push(returnsJSX);
              }
              break;
            }
            // case: export default class MyClass() {}
            case "ClassDeclaration": {
              const extendsReact = isClassExtendsReact({
                export_type,
                declaration,
                declaration_type,
                verified,
              });
              if (extendsReact) {
                exports.push(extendsReact);
              }
              break;
            }
          }
          break;
        }
        case "named": {
          switch (declaration_type) {
            case "VariableDeclaration":
            case "FunctionDeclaration":
            case "ClassDeclaration": {
              const parsedDecl = parseDeclarations([declaration]);
              const { constants, functions, classes } = verify(parsedDecl);
              constants.forEach((constant) => {
                exports.push({
                  ...constant,
                  export_type,
                  declaration,
                  declaration_type,
                });
              });
              functions.forEach((func) => {
                exports.push({
                  ...func,
                  export_type,
                  declaration,
                  declaration_type,
                });
              });
              classes.forEach((clas) => {
                exports.push({
                  ...clas,
                  export_type,
                  declaration,
                  declaration_type,
                });
              });
            }
          }
          break;
        }
      }
    },
  );

  tentativeClasses.map((tentativeClass) => {
    const extendsReact = isClassExtendsReact(tentativeClass);
    if (extendsReact) {
      classes.push(extendsReact);
    }
  });

  return { constants, functions, classes, exports };
}

function containsHook(item) {
  let foundHook = false;
  item.traverse({
    // see if you can spot a Hook called within this item
    CallExpression(path) {
      const callee = path.get("callee");
      const callee_type = callee.node.type;
      switch (callee_type) {
        case "MemberExpression": {
          if (callee.node.object.name === "React") {
            foundHook = true;
          }
          break;
        }
        case "Identifier": {
          const callee_name = callee.node.name;
          switch (callee_name) {
            case "useEffect":
            case "useState":
            case "useReducer": {
              foundHook = true;
            }
          }
          break;
        }
      }
    },
  });

  return foundHook;
}

function returnsJSXElement(input) {
  const isExportDeclaration = Boolean(input.export_type);
  const declaration_type = input.declaration_type;
  switch (declaration_type) {
    case "ArrowFunctionExpression":
    case "VariableDeclaration": {
      const {
        export_type,
        init_type,
        body_type,
        declarator,
        declaration,
        declaration_type,
        verified = new Set(),
      } = input;
      switch (init_type) {
        case "ArrowFunctionExpression": {
          switch (body_type) {
            // case: const Component = () => <div></div>;
            case "JSXElement": {
              verified.add("returns JSXElement");
              return {
                export_type,
                init_type,
                body_type,
                declarator,
                declaration,
                declaration_type,
                verified,
              };
            }
            // case: const Component = () => { return <div></div> }
            case "BlockStatement": {
              const blockStatement_body = isExportDeclaration
                ? input.declaration.get("body").get("body")
                : declarator.get("init").get("body").get("body");

              const decl = isExportDeclaration ? input.declaration : declarator;
              let returnsJSX = false;
              decl.traverse({
                // do not enter nested functions
                Function(path) {
                  if (path !== decl) {
                    return;
                  }
                },
                ReturnStatement(path) {
                  const arg = path.get("argument");
                  if (!arg) return;
                  // see if you can spot a JSXElement in the return statement
                  // if so, this constant declarator/declaration returns a JSXElement
                  if (arg.type === "JSXElement" || arg.type === "JSXFragment") {
                    returnsJSX = true;
                    return;
                  }
                  arg.traverse({
                    JSXElement() {
                      returnsJSX = true;
                      return;
                    },
                    JSXFragment() {
                      returnsJSX = true;
                      return;
                    },
                    Function(inner) {
                      inner.skip();
                    },
                  });
                },
              });
              if (returnsJSX) {
                verified.add("returns JSXElement");
              }

              // iterate through the block statement body's content to find hooks
              for (const item of blockStatement_body) {
                /*if (item.node.type === "ReturnStatement") {
                  item.traverse({
                    // see if you can spot a JSXElement in the return statement
                    JSXElement() {
                      // then this constant declarator/declaration returns a JSXElement
                      returnsJSX = true;
                    },
                  });
                }*/
                if (containsHook(item)) {
                  verified.add("contains a hook");
                }
                if (verified.size > 0) {
                  return {
                    export_type,
                    init_type,
                    body_type,
                    declarator,
                    declaration,
                    declaration_type,
                    verified,
                  };
                }
              }
              return undefined;
            }
          } // End of switch(body_type)
          break;
        } // End of ArrowFunctionExpression
        // case: const Component = <div></div>
        case "JSXElement": {
          verified.add("returns JSXElement");
          return {
            export_type,
            init_type,
            declarator,
            declaration_type,
            verified,
          };
        }
      }
      break;
    }
    case "FunctionDeclaration": {
      const {
        export_type,
        declaration,
        declaration_type,
        verified = new Set(),
      } = input;
      // case: function Component() { return <div></div> }
      let returnsJSX = false;
      declaration.traverse({
        // do not enter nested functions
        Function(path) {
          if (path !== declaration) {
            return;
          }
        },
        ReturnStatement(path) {
          const arg = path.get("argument");
          if (!arg) return;
          // see if you can spot a JSXElement in the return statement
          // if so, this constant declarator/declaration returns a JSXElement
          if (arg.type === "JSXElement" || arg.type === "JSXFragment") {
            returnsJSX = true;
            return;
          }
          arg.traverse({
            JSXElement() {
              returnsJSX = true;
              return;
            },
            JSXFragment() {
              returnsJSX = true;
              return;
            },
            Function(inner) {
              inner.skip();
            },
          });
        },
      });
      if (returnsJSX) {
        verified.add("returns JSXElement");
      }

      // iterate through the block statement body's content to find hooks
      const blockStatement_body = declaration.get("body").get("body");
      for (const item of blockStatement_body) {
        if (containsHook(item)) {
          verified.add("contains a hook");
        }
        /*
      for (const item of blockStatement_body) {
        let returnsJSX = false;
        if (item.node.type === "ReturnStatement") {
          item.traverse({
            // see if you can spot a JSXElement in the return statement
            JSXElement() {
              // if so, we've verified, this constant declarator returns a JSXElement
              returnsJSX = true;
            },
          });
        }
        if (containsHook(item)) {
          verified.push("contains a hook");
        }
        if (returnsJSX) {
          verified.push("returns JSXElement");
        }*/
        if (verified.size > 0) {
          verified.add("returns JSXElement");
          return {
            export_type,
            declaration,
            declaration_type,
            verified,
          };
        }
      }
      return undefined;
    }
  }
}

function isNestedInComponentFactory({
  export_type,
  init_type,
  declaration_type,
  declarator,
  declaration,
  verified = new Set(),
}) {
  // cases:
  // constant (declarator) --> const Component = memo(() => {}) or forwardref(ComponentName)
  // export (declaration) --> export default forwardRef(() => {})
  const callExpression = declarator ? declarator.get("init") : declaration;
  const calleeName = callExpression.get("callee").node.name;
  if (calleeName === "memo" || calleeName === "forwardRef") {
    verified.add("is nested in component factory");
    return {
      export_type,
      declaration_type,
      init_type,
      declarator,
      declaration,
      verified,
    };
  }
  return undefined;
}

function isClassExtendsReact({
  export_type,
  declaration,
  declaration_type,
  verified = new Set(),
}) {
  const superClass = declaration.get("superClass");
  switch (superClass.node.type) {
    case "Identifier": {
      // case: class Component extends Component {}
      const superClassName = superClass.node.name;
      if (
        superClassName === "Component" ||
        superClassName === "PureComponent"
      ) {
        verified.add("class extends react");
        return { export_type, declaration, declaration_type, verified };
      }
      break;
    }
    case "MemberExpression": {
      // case: class Component extends React.Component {}
      const superClassObjectName = superClass.get("object").node.name;
      const superClassPropertyName = superClass.get("property").node.name;
      if (
        superClassObjectName === "React" &&
        (superClassPropertyName === "Component" ||
          superClassPropertyName === "PureComponent")
      ) {
        verified.add("class extends react");
        return { export_type, declaration, declaration_type, verified };
      }
      break;
    }
  }
  return undefined;
}

module.exports = verifyReactComponents;
