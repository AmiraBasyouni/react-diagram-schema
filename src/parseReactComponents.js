// parseReactComponents.js

const collectTopLevelDeclarations = require("./collectTopLevelDeclarations");
//const validateReactComponents = require("./validateReactComponents");

// validated components are constants, functions, classes
function parseReactComponents(validatedComponents, filepath) {
  const internalDeclarations = {};
  function extract(validatedComponents = []) {
    return validatedComponents.map(
      ({ init_type, body_type, declarator, declaration }) => {
        const obj = {
          name: "",
          description: "",
          descendants: [],
          internal: { states: [], functions: [] },
          external: { props: [], context: [], constants: [] },
          defaultExport: false,
          location: null,
          unresolvedDescendants: new Set(),
        };

        const componentPath = declarator ? declarator : declaration;

        //EXTRACT name
        obj.name = componentPath.node.id ? componentPath.node.id.name : "";

        //EXTRACT location
        obj.location = {
          line: componentPath.node?.loc.start.line,
          filepath,
        };

        // correct the scope of componentPath based on init_type and body_type
        let component_path = componentPath;
        if (init_type === "ArrowFunctionExpression") {
          component_path = componentPath.get("init");
          if (
            body_type === "CallExpression" &&
            component_path.node.callee.name === "forwardRef"
          ) {
            component_path = component_path.get("arguments")[0];
          }
        }
        const correctedComponentPath = component_path;

        //-- IF BLOCK STATEMENT EXISTS (guards against omitted block statement  () =><h1>JSX</h1>) ------------------------
        if (body_type === "BlockStatement" || declaration) {
          const blockStatement_body = correctedComponentPath
            .get("body")
            .get("body");

          Object.assign(
            internalDeclarations,
            collectTopLevelDeclarations(blockStatement_body),
          );
          const internalFunctionDeclarations =
            internalDeclarations.regular_functions;
          const internalArrowFunctionDeclarations =
            internalDeclarations.regular_constants.filter(
              ({ init_type }) => init_type === "ArrowFunctionExpression",
            );

          //EXTRACT function names --> [ "func1", "func2", ... ]
          // function-defined
          obj.internal.functions = internalFunctionDeclarations
            .map((functionDecl) => functionDecl.node.id?.name)
            //.map((fn) => fn.node.id?.name) // access name if it exists
            .filter(Boolean); // filter out any undefined or null names
          // inline arrow functions
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

          const component_returnStatement =
            internalDeclarations.returnStatement[0];
          //EXTRACT COMPONENT DESCENDANTS
          extractComponentDescendants(component_returnStatement, obj);
        } // ---- END OF BLOCK STATEMENT CODE ---------------------------------------------

        //EXTRACT non-blockstatement COMPONENT DESCENDANTS (e.g. () => JSX instead of () => {return JSX})
        if (correctedComponentPath.get("body").isJSXElement()) {
          extractComponentDescendants(correctedComponentPath, filepath, obj);
        }

        //EXTRACT externally defined props -> ["propA", "propB", "propC", ...]
        // if component contains parameters, parse them
        if (correctedComponentPath.node.params?.length > 0) {
          const componentParamsArray = correctedComponentPath.get("params");
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
  const nestedFunctionDefinedComponentsMetadata = extract(
    internalDeclarations.functions,
  );
  const nestedInlineComponentsMetadata = extract(
    internalDeclarations.constants,
  );
  const nestedInlineVariablesMetadata = extract(
    internalDeclarations.regular_constants,
  );
  nestedFunctionDefinedComponentsMetadata.map(
    (nestedComponent) => (nestedComponent.nested = true),
  );
  nestedInlineComponentsMetadata.map(
    (nestedComponent) => (nestedComponent.nested = true),
  );
  nestedInlineVariablesMetadata.map(
    (nestedVariable) => (nestedVariable.nested = true),
  );

  //metadata.push(...nestedFunctionDefinedComponentsMetadata);
  //metadata.push(...nestedInlineComponentsMetadata);
  //metadata.push(...nestedInlineVariablesMetadata);

  const components = {};
  metadata.forEach(
    (component) =>
      (components[`${component.name}::${component.location.filepath}`] =
        component),
  );

  return components;
}

function extractComponentDescendants(returnStatementPath, obj) {
  //EXTRACT component descendants
  const descendantsMap = new Map();
  (returnStatementPath?.traverse({
    JSXElement(childPath) {
      const opening = childPath.node.openingElement;

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
    },
  }),
    (obj.descendants = descendantsMap));
  obj.unresolvedDescendants = Array.from(obj.unresolvedDescendants);
}

module.exports = parseReactComponents;
