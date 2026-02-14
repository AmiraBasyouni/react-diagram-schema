// verifyReactComponents.js
// goals:
// - indicator 1: a component must start with a capital letter (verified in parseFile())
// - indicator 2: a component must either return JSX, be nested in a component factory, or come as class extends React
// - test refactor on the html-input repo
// - achieve:
//   --> better code readability,
//   --> don't consider `const anArray = []` as a component,
//   --> continue to consider `const Component = as`

//const traverse = require("@babel/traverse").default;
const parseDeclarations = require("./collectTopLevelDeclarations");

function verifyReactComponents(topLevelDeclarations) {
  // indicator 2: is at least one of these true? returnsJSXElement || isNestedInComponentFactory || isClassExtendsReact
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
  isClassExtendsReact(path);
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
    ({ init_type, body_type, declarator, declaration_type, verified = [] }) => {
      switch (init_type) {
        case "ArrowFunctionExpression": {
          // case: const Component = () => <div></div>;
          // case: const Component = () => { return <div></div> }
          const returnsJSX = returnsJSXElement({
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
          verified.push("returns JSXElement");
          constants.push({
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

  tentativeFunctions.map(({ declaration, declaration_type, verified = [] }) => {
    // case: function Component() { return <div></div> }
    const returnsJSX = returnsJSXElement({
      declaration,
      declaration_type,
      verified,
    });
    if (returnsJSX) {
      functions.push(returnsJSX);
    }
  });

  tentativeExports.map(
    ({ declaration, export_type, declaration_type, verified = [] }) => {
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

function returnsJSXElement(input) {
  const isExportDeclaration = Boolean(input.export_type);
  const declaration_type = input.declaration_type;
  switch (declaration_type) {
    case "ArrowFunctionExpression":
    case "VariableDeclaration": {
      const {
        init_type,
        body_type,
        declarator,
        declaration,
        export_type,
        declaration_type,
        verified = [],
      } = input;
      switch (init_type) {
        case "ArrowFunctionExpression": {
          switch (body_type) {
            // case: const Component = () => <div></div>;
            case "JSXElement": {
              verified.push("returns JSXElement");
              return {
                init_type,
                body_type,
                declarator,
                declaration,
                export_type,
                declaration_type,
                verified,
              };
            }
            // case: const Component = () => { return <div></div> }
            case "BlockStatement": {
              const blockStatement_body = //getBody(isExportDeclaration);
                isExportDeclaration
                  ? input.declaration.get("body").get("body")
                  : declarator.get("init").get("body").get("body");
              // iterate through the block statement body's content to find the return statements
              for (const item of blockStatement_body) {
                let isVerified = false;
                //blockStatement_body.forEach((item) => {
                if (item.node.type === "ReturnStatement") {
                  item.traverse({
                    // see if you can spot a JSXElement in the return statement
                    JSXElement() {
                      // if so, we've verified, this constant declarator returns a JSXElement
                      isVerified = true;
                    },
                  });
                  if (isVerified) {
                    verified.push("returns JSXElement");
                    return {
                      init_type,
                      body_type,
                      declarator,
                      declaration,
                      export_type,
                      declaration_type,
                      verified,
                    };
                  }
                }
              }
              //});
              return undefined;
            }
          } // End of switch(body_type)
          break;
        } // End of ArrowFunctionExpression
        // case: const Component = <div></div>
        case "JSXElement": {
          verified.push("returns JSXElement");
          return {
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
      const { declaration, declaration_type, verified = [] } = input;
      // case: function Component() { return <div></div> }
      const blockStatement_body = declaration.get("body").get("body");
      for (const item of blockStatement_body) {
        //blockStatement_body.forEach((item) => {
        let isVerified = false;
        if (item.node.type === "ReturnStatement") {
          item.traverse({
            // see if you can spot a JSXElement in the return statement
            JSXElement() {
              // if so, we've verified, this constant declarator returns a JSXElement
              isVerified = true;
            },
          });
          if (isVerified) {
            verified.push("returns JSXElement");
            return {
              declaration,
              declaration_type,
              verified,
            };
          }
        }
        //});
      }
      return undefined;
    }
  }
}

function isNestedInComponentFactory({
  init_type,
  declaration_type,
  declarator,
  declaration,
  verified = [],
}) {
  // cases:
  // constant (declarator) --> const Component = memo(() => {}) or forwardref(ComponentName)
  // export (declaration) --> export default forwardRef(() => {})
  const callExpression = declarator ? declarator.get("init") : declaration;
  const calleeName = callExpression.get("callee").node.name;
  if (calleeName === "memo" || calleeName === "forwardRef") {
    verified.push("is nested in component factory");
    return {
      declaration_type,
      init_type,
      declarator,
      declaration,
      verified,
    };
  }
  return undefined;
}

function isClassExtendsReact({ declaration, declaration_type, verified = [] }) {
  const superClass = declaration.get("superClass");
  switch (superClass.node.type) {
    case "Identifier": {
      // case: class Component extends Component {}
      const superClassName = superClass.node.name;
      if (
        superClassName === "Component" ||
        superClassName === "PureComponent"
      ) {
        verified.push("class extends react");
        return { declaration, declaration_type, verified };
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
        verified.push("class extends react");
        return { declaration, declaration_type, verified };
      }
      break;
    }
  }
  return undefined;
}

module.exports = verifyReactComponents;
