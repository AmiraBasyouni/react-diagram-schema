// parseReactComponents.js

const collectTopLevelDeclarations = require("./collectTopLevelDeclarations");
const verifyReactComponents = require("./verifyReactComponents");

// validated components are constants, functions, classes
function parseReactComponents(validatedComponents, filepath) {
  const internalDeclarations = {
    constants: [],
    functions: [],
    classes: [],
    exports: [],
  };
  function extract(validatedComponents = []) {
    return validatedComponents.map(
      ({
        init_type,
        body_type,
        declarator,
        declaration,
        declaration_type,
        export_type,
        verified,
      }) => {
        const obj = {
          name: "",
          description: "",
          descendants: [],
          internal: { states: [], functions: [] },
          external: { props: [], context: [], constants: [] },
          defaultExport: export_type && export_type === "default",
          location: null,
          unresolvedDescendants: new Set(),
        };

        const decl = declarator ? declarator : declaration;

        //EXTRACT name
        obj.name = decl.node.id ? decl.node.id.name : "";

        //EXTRACT location
        obj.location = {
          line: decl.node.loc.start.line,
          filepath,
        };

        // early return in case of
        if (verified.has("is nested in component factory")) {
          // const Component = memo(OtherComponent)
          // or export const Component = memo(OtherComponent)
          if (
            declaration_type === "VariableDeclaration" &&
            decl.get("init").node.arguments[0].type === "Identifier"
          ) {
            return obj;
          }
          // or export default memo(OtherComponent)
          if (
            declaration_type === "CallExpression" &&
            decl.node.arguments[0].type === "Identifier"
          ) {
            return obj;
          }
          // otherwise this is probably a forwardRef( () => {} )
        }

        // correct the scope of componentPath based on init_type
        function getComponentPath() {
          if (declaration_type !== "VariableDeclaration") {
            return declaration;
          }
          const init =
            declaration && export_type === "default"
              ? declaration
              : declarator.get("init");
          if (init_type === "CallExpression") {
            return init.get("arguments")[0];
          }
          return init;
        }
        const componentPath = getComponentPath();

        //-- IF BLOCK STATEMENT EXISTS (guards against omitted block statement  () =><h1>JSX</h1>) ------------------------
        function declHasBlockStatement() {
          const body = componentPath.get("body");
          if (!body) return false;

          if (body.isBlockStatement()) return true;

          return false;
        }

        if (body_type === "BlockStatement" || declHasBlockStatement()) {
          const blockStatement_body = componentPath.get("body").get("body");

          Object.assign(
            internalDeclarations,
            collectTopLevelDeclarations(blockStatement_body),
          );
          const internalFunctionDeclarations = [
            ...internalDeclarations.regular_functions,
            ...internalDeclarations.functions.map(
              ({ declaration }) => declaration,
            ),
          ];
          const internalArrowFunctionDeclarations = [
            ...internalDeclarations.regular_constants.filter(
              ({ init_type }) => init_type === "ArrowFunctionExpression",
            ),
            ...internalDeclarations.constants.filter(
              ({ init_type }) => init_type === "ArrowFunctionExpression",
            ),
          ];

          //EXTRACT function names --> [ "func1", "func2", ... ]
          // A. function-defined
          obj.internal.functions = internalFunctionDeclarations
            .map((func) => func.node.id?.name)
            //.map((fn) => fn.node.id?.name) // access name if it exists
            .filter(Boolean); // filter out any undefined or null names
          // B. inline arrow functions
          const inline = internalArrowFunctionDeclarations
            .map(({ declarator }) => declarator.node.id?.name)
            .filter(Boolean);
          // append inline arrow functions
          obj.internal.functions.push(...inline);

          // helper function: verify reactHook is useState | useContext
          const isStateVariable = (path, reactHook) => {
            if (path.get("init").get("callee").isIdentifier()) {
              return path.node.init.callee.name === reactHook; // useState | useContext
            } else if (path.get("init").get("callee").isMemberExpression()) {
              return path.node.init.callee.property.name === reactHook; // useState | useContext
            } else {
              return false;
            }
          };
          // extract useState declarators from VariableDeclarations
          const useState_declarators =
            internalDeclarations.regular_constants.filter(
              ({ init_type, declarator }) =>
                init_type === "CallExpression" &&
                isStateVariable(declarator, "useState"),
            );

          //EXTRACT states --> [ ["a", "setA"], ["b", "setB"], ... ]
          const state_values = useState_declarators.map(({ declarator }) =>
            declarator.node.id.elements.map((element) => element.name),
          );
          obj.internal.states = state_values;

          // extract useContext declarators
          const context_declarators =
            internalDeclarations.regular_constants.filter(
              ({ init_type, declarator }) => {
                return (
                  init_type === "CallExpression" &&
                  isStateVariable(declarator, "useContext")
                );
              },
            );
          //EXTRACT context `source` and `values` -> [{ source: "ContextName", values: [value1, value2, ...]}, ....]
          const context = [];
          context_declarators.forEach(({ declarator }) => {
            const source = declarator.node.init.arguments[0].name;
            const values = [];
            if (declarator.get("id").isIdentifier()) {
              values.push(declarator.node.id.name);
            } else if (declarator.get("id").isObjectPattern()) {
              declarator.node.id.properties.forEach((objectProperty) =>
                values.push(objectProperty.key.name),
              );
            }
            context.push({ source, values });
          });
          obj.external.context = context;

          const returnStatementPath = internalDeclarations.returnStatement[0];
          //EXTRACT COMPONENT DESCENDANTS
          extractComponentDescendants({ returnStatementPath, obj });
        } // ---- END OF BLOCK STATEMENT CODE ---------------------------------------------

        //EXTRACT non-blockstatement COMPONENT DESCENDANTS (e.g. () => JSX in ArrowFunctionExpressions)
        else {
          const returnStatementPath = componentPath.get("body");
          extractComponentDescendants({ returnStatementPath, obj });
        }

        //EXTRACT externally defined props -> ["propA", "propB", "propC", ...]
        // if component contains parameters, parse them
        if (componentPath.node.params?.length > 0) {
          const componentParamsArray = componentPath.get("params");
          // for each parameter
          componentParamsArray.forEach((param) => {
            // if the parameter is an object { }
            if (param.isObjectPattern()) {
              // extract each prop
              param.get("properties").forEach((prop) => {
                if (prop.isObjectProperty()) {
                  //CASE: prop type is an ObjectProperty
                  obj.external.props.push(prop.node.key.name);
                } else if (prop.isRestElement()) {
                  // CASE: prop type is a RestElement
                  obj.external.props.push(`...${prop.node.argument.name}`);
                }
              });
              // if the parameter is an identifier (e.g. ref)
            } else if (param.isIdentifier()) {
              obj.external.props.push(param.node.name);
            }
          });
        }
        return obj;
      },
    );
  }
  const metadata = extract(validatedComponents);
  const nestedDeclarations = extract(
    verifyReactComponents(internalDeclarations),
  );
  const nestedDeclarationsMetadata = nestedDeclarations.map((nestedDecl) => {
    nestedDecl.nested = true;
    return nestedDecl;
  });

  metadata.push(...nestedDeclarationsMetadata);

  const components = {};
  metadata.forEach((component) => {
    components[`${component.name}::${component.location.filepath}`] = component;
  });

  return components;
}

function extractComponentDescendants({ returnStatementPath, obj }) {
  const descendantsMap = new Map();

  function handleJSXElement(elementPath) {
    const opening = elementPath.node.openingElement;

    // Handle <SomeComponent>
    let tagName = "";
    if (opening.name.type === "JSXIdentifier") {
      tagName = opening.name.name;
    } else if (opening.name.type === "JSXMemberExpression") {
      // Handle <Some.Component>
      // Get only the rightmost name (e.g., Some.Component -> "Component")
      // NOTE: this step, extracting provider derived components, will be temporarily skipped until bugs are fixed
      //tagName = opening.name.property.name;
      if (tagName === "Provider") {
        // invalid descendant: ignore Provider, do not add it to the list of descendants
        tagName = undefined;
      }
    }

    // Only add component-like elements (capitalized, not HTML tags)
    if (tagName && /^[A-Z]/.test(tagName)) {
      // create a temporary list of this component's unresolved descendants
      // (this list gets resolved in build-schema.js)
      obj.unresolvedDescendants.add(tagName);
      descendantsMap.set(tagName, {
        location: {},
      });
    }
  }

  //EXTRACT component descendants
  if (returnStatementPath.isJSXElement()) {
    handleJSXElement(returnStatementPath);
  }
  (returnStatementPath.traverse({
    JSXElement(elementPath) {
      handleJSXElement(elementPath);
    },
  }),
    (obj.descendants = descendantsMap));
  obj.unresolvedDescendants = Array.from(obj.unresolvedDescendants);
}

module.exports = parseReactComponents;
