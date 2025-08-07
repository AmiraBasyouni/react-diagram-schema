// extractMetadata.js
const componentIsDeclaredInCode = require("./componentIsDeclaredInCode");

function extractMetadata(componentPaths, type, code, filepath) {
  //EXTRACT { name: "", internal: {states: [], functions: []}, location: null } FROM EACH REACT COMPONENT
  const metadata = componentPaths.map((componentPath) => {
    const obj = {
      name: "",
      description: "",
      descendants: [],
      internal: { states: [], functions: [] },
      external: { props: [], context: [], constants: [] },
      location: null,
      unresolvedDescendants: [],
    };

    //--INTERNAL STRUCTURE -----------------------------
    //EXTRACT name AND location
    obj.name = componentPath.node.id.name;
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
      //EXTRACT internal functions from a React Component -> [ "func1", "func2", ... ]
      const blockStatementBody_path = componentInternalPath
        .get("body")
        .get("body");
      // function-defined
      obj.internal.functions = blockStatementBody_path
        .filter((path) => path.isFunctionDeclaration())
        .map((fn) => fn.node.id?.name) // access name if it exists
        .filter(Boolean); // filter out any undefined or null names
      // inline arrow functions
      const inline = blockStatementBody_path
        .filter((path) => path.isVariableDeclaration())
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

      // helper variable: extract VariableDeclarations from a React component
      const component_VarDeclarations = componentInternalPath
        .get("body")
        .get("body")
        .filter((path) => path.isVariableDeclaration());

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
              (path) => isValidPath(path) && isStateVariable(path, "useState"),
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

      // helper variable: extract component's return statement
      const component_returnStatementPath = componentExternalPath
        .get("body")
        .get("body")
        .filter((path) => path.isReturnStatement());

      //EXTRACT component descendents
      const descendantsMap = new Map();
      component_returnStatementPath.forEach((returnStatement) =>
        returnStatement.traverse({
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
              if (componentIsDeclaredInCode(code, tagName)) {
                /* and record its declaration line */
                descendantsMap.set(tagName, {
                  location: {
                    //line: descendantLocation?.start.line,
                    filepath,
                  },
                });
              } else {
                obj.unresolvedDescendants.push(tagName);
                descendantsMap.set(tagName, {
                  location: {},
                });
              }
            }
          },
        }),
      );
      obj.descendants = descendantsMap;
    }
    // ---- END OF BLOCK STATEMENT CODE ---------------------------------------------

    // helper variable: filter component props from a component's parameter list
    const component_props =
      componentExternalPath.node.params.length > 0
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
  return metadata;
}

module.exports = extractMetadata;
