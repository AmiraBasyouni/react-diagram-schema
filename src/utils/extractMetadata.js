// extractMetadata.js
const componentIsDeclaredInCode = require("./componentIsDeclaredInCode");
const isFunctionDefinedReactComponent = require("./isFunctionDefinedReactComponent");
const isInlineReactComponent = require("./isInlineReactComponent");

function extractMetadata(componentPaths, type, code, filepath) {
  const nestedFunctionDefinedComponents = [];
  const nestedInlineComponents = [];
  //EXTRACT { name: "", internal: {states: [], functions: []}, location: null } FROM EACH REACT COMPONENT
  function extract(componentPaths, type) {
    return componentPaths.map((componentPath) => {
      const obj = {
        name: "",
        description: "",
        descendants: [],
        internal: { states: [], functions: [] },
        external: { props: [], context: [], constants: [] },
        location: null,
        unresolvedDescendants: new Set(),
      };

      //--INTERNAL STRUCTURE -----------------------------
      //EXTRACT name AND location
      obj.name = componentPath.node.id ? componentPath.node.id.name : "";
      obj.location = {
        line: componentPath.node?.loc.start.line,
        filepath,
      };
      const componentInternalPath =
        type === "inline" ? componentPath.get("init") : componentPath;
      const componentExternalPath =
        type === "inline" ? componentPath.get("init") : componentPath;

      //-- IF BLOCK STATEMENT EXISTS (guards against omitted block statement  () =><h1>JSX</h1>) ------------------------
      if (componentInternalPath.get("body").isBlockStatement()) {
        const blockStatementBody_array = componentInternalPath
          .get("body")
          .get("body");
        // helper variable: extract FunctionDeclarations from a React component
        const component_FuncDeclarations = blockStatementBody_array.filter(
          (path) => path.isFunctionDeclaration(),
        );
        // helper variable: extract VariableDeclarations from a React component
        const component_VarDeclarations = blockStatementBody_array.filter(
          (path) => path.isVariableDeclaration(),
        );
        //EXTRACT internal functions from a React Component -> [ "func1", "func2", ... ]
        // function-defined
        obj.internal.functions = component_FuncDeclarations
          .map((fn) => fn.node.id?.name) // access name if it exists
          .filter(Boolean); // filter out any undefined or null names
        // inline arrow functions
        const inline = component_VarDeclarations
          .flatMap((varDeclaration) =>
            varDeclaration.get("declarations").map((declarator) => {
              if (
                declarator.isVariableDeclarator() &&
                declarator.get("init").isArrowFunctionExpression()
              ) {
                return declarator.node.id?.name;
              }
            }),
          )
          .filter(Boolean);
        obj.internal.functions.push(...inline);

        //EXTRACT nested COMPONENTS
        const nestedFunctionDefinedComponents_extracted =
          blockStatementBody_array.filter((path) =>
            isFunctionDefinedReactComponent(path),
          );
        nestedFunctionDefinedComponents.push(
          ...nestedFunctionDefinedComponents_extracted,
        );
        const nestedInlineComponents_extracted = blockStatementBody_array
          .filter((path) => isInlineReactComponent(path))
          .map((declaration) => declaration.get("declarations")[0]);
        nestedInlineComponents.push(...nestedInlineComponents_extracted);

        // helper functions: verify node path and valid state variable
        const isValidPath = (path) =>
          path.isVariableDeclarator() && path.get("init").isCallExpression();
        const isStateVariable = (path, reactHook) => {
          if (path.get("init").get("callee").isIdentifier()) {
            return path.node.init.callee.name === reactHook; // useState | useContext
          } else if (path.get("init").get("callee").isMemberExpression()) {
            return path.node.init.callee.property.name === reactHook; // useState | useContext
          } else {
            return false;
          }
        };
        // helper variable: extract state declarators from VariableDeclarations
        const state_declarators = component_VarDeclarations.flatMap(
          (declarationPath) =>
            declarationPath
              .get("declarations")
              .filter(
                (path) =>
                  isValidPath(path) && isStateVariable(path, "useState"),
              ),
        );
        //EXTRACT internally defined states -> [ ["a", "setA"], ["b", "setB"], ... ]
        const state_values = state_declarators.map((declarator) =>
          declarator.node.id.elements.map((element) => element.name),
        );
        obj.internal.states = state_values;

        //--EXTERNAL STRUCTURE -----------------------------
        // helper variable: extract useContext declarators
        const context_declarators = component_VarDeclarations.flatMap(
          (declarationPath) =>
            declarationPath
              .get("declarations")
              .filter(
                (path) =>
                  isValidPath(path) && isStateVariable(path, "useContext"),
              ),
        );
        //EXTRACT externally defined context `source` and `values` -> [{ source: "ContextName", values: [value1, value2, ...]}, ....]
        const context = [];
        context_declarators.forEach((declaratorPath) => {
          const source = declaratorPath.node.init.arguments[0].name;
          const values = [];
          if (declaratorPath.get("id").isIdentifier()) {
            values.push(declaratorPath.node.id.name);
          } else if (declaratorPath.get("id").isObjectPattern()) {
            declaratorPath.node.id.properties.forEach((objectProperty) =>
              values.push(objectProperty.key.name),
            );
          }
          context.push({ source, values });
        });
        obj.external.context = context;

        //EXTRACT blockstatement COMPONENT DESCENDANTS
        // helper variable: extract component's return statement
        const component_returnStatementPaths = blockStatementBody_array.filter(
          (path) => path.isReturnStatement(),
        );

        extractComponentDescendants(
          component_returnStatementPaths[0],
          filepath,
          code,
          obj,
        );
      }

      // ---- END OF BLOCK STATEMENT CODE ---------------------------------------------

      //EXTRACT non-blockstatement COMPONENT DESCENDANTS (e.g. () => JSX instead of () => {return JSX})
      if (componentInternalPath.get("body").isJSXElement()) {
        extractComponentDescendants(componentInternalPath, filepath, code, obj);
      }

      // helper variable: filter component props from a component's parameter list
      const component_props =
        componentExternalPath.node.params?.length > 0
          ? componentExternalPath.node.params[0].properties
          : [];

      //EXTRACT externally defined props -> ["propA", "propB", "propC", ...]
      obj.external.props = component_props?.map((object) => {
        if (object.type === "ObjectProperty") {
          //CASE: prop type is an ObjectProperty
          return object.key.name;
        } else if (object.type === "RestElement") {
          // CASE: prop type is a RestElement
          return `...${object.argument.name}`;
        }
      });

      //obj.descendants = Array.from(descendantsMap.entries()).map(
      //  ([name, metadata]) => ({ name, ...metadata }),
      //);
      return obj;
    });
  }

  const metadata = extract(componentPaths, type);
  const nestedFunctionDefinedComponentsMetadata = extract(
    nestedFunctionDefinedComponents,
    "defined",
  );
  const nestedInlineComponentsMetadata = extract(
    nestedInlineComponents,
    "inline",
  );
  nestedFunctionDefinedComponentsMetadata.map(
    (nestedComponent) => (nestedComponent.nested = true),
  );
  nestedInlineComponentsMetadata.map(
    (nestedComponent) => (nestedComponent.nested = true),
  );

  metadata.push(...nestedFunctionDefinedComponentsMetadata);
  metadata.push(...nestedInlineComponentsMetadata);

  return metadata;
}

function extractComponentDescendants(returnStatementPath, filepath, code, obj) {
  //EXTRACT component descendants
  const descendantsMap = new Map();
  (returnStatementPath.traverse({
    JSXElement(childPath) {
      const opening = childPath.node.openingElement;

      // Handle <SomeComponent>
      let tagName = "";
      if (opening.name.type === "JSXIdentifier") {
        tagName = opening.name.name;
      } else if (opening.name.type === "JSXMemberExpression") {
        // Handle <Some.Component>
        // Get only the rightmost name (e.g., Some.Component -> "Component")
        tagName = opening.name.property.name;
        if (tagName === "Provider") {
          // invalid descendant: ignore Provider, do not add it to the list of descendants
          tagName = undefined;
        }
      }

      // Only add component-like elements (capitalized, not HTML tags)
      if (tagName && /^[A-Z]/.test(tagName)) {
        const isEntryComponent = false;
        if (componentIsDeclaredInCode(code, tagName, isEntryComponent)) {
          /* and record its declaration line */
          descendantsMap.set(tagName, {
            location: {
              //line: descendantLocation?.start.line,
              filepath,
            },
          });
        } else {
          obj.unresolvedDescendants.add(tagName);
          descendantsMap.set(tagName, {
            location: {},
          });
        }
      }
    },
  }),
    (obj.descendants = descendantsMap));
  obj.unresolvedDescendants = Array.from(obj.unresolvedDescendants);
}

module.exports = extractMetadata;
