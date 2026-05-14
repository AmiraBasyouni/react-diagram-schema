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
  const resolvedDescendants = [];
  function extract(validatedComponents = []) {
    return validatedComponents.map(
      ({
        init_type,
        body_type,
        declarator,
        declaration,
        declaration_type,
        export_type,
        verified = new Set(),
      }) => {
        const component = {
          name: "",
          description: "",
          descendants: [],
          internal: { states: [], functions: [] },
          external: { props: [], context: [], constants: [] },
          defaultExport: export_type && export_type === "default",
          location: null,
          unresolvedDescendants: new Map(),
        };

        const decl = declarator ? declarator : declaration;

        //EXTRACT name
        component.name = decl.node.id ? decl.node.id.name : "";

        //EXTRACT location
        component.location = {
          line: decl.node.loc.start.line,
          filepath,
        };

        // early return when
        if (verified.has("is nested in component factory")) {
          // const Component = memo(OtherComponent)
          // or export const Component = memo(OtherComponent)
          if (
            declaration_type === "VariableDeclaration" &&
            decl.get("init").node.arguments[0].type === "Identifier"
          ) {
            return component;
          }
          // or export default memo(OtherComponent)
          if (
            declaration_type === "CallExpression" &&
            decl.node.arguments[0].type === "Identifier"
          ) {
            return component;
          }
          // otherwise this can be a forwardRef( () => {} )
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
          component.internal.functions = internalFunctionDeclarations
            .map((func) => func.node.id?.name)
            //.map((fn) => fn.node.id?.name) // access name if it exists
            .filter(Boolean); // filter out any undefined or null names
          // B. inline arrow functions
          const inline = internalArrowFunctionDeclarations
            .map(({ declarator }) => declarator.node.id?.name)
            .filter(Boolean);
          // append inline arrow functions
          component.internal.functions.push(...inline);

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
          component.internal.states = state_values;

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
          component.external.context = context;

          const returnStatementPath = internalDeclarations.returnStatement[0];
          //EXTRACT COMPONENT DESCENDANTS
          const resolvedDescendant = extractComponentDescendants({
            returnStatementPath,
            component,
            filepath,
          });
          if (resolvedDescendant) {
            resolvedDescendants.push(resolvedDescendant);
          }
        } // ---- END OF BLOCK STATEMENT CODE ---------------------------------------------

        //EXTRACT non-blockstatement COMPONENT DESCENDANTS (e.g. () => JSX in ArrowFunctionExpressions)
        else {
          const returnStatementPath = componentPath.get("body");
          //EXTRACT COMPONENT DESCENDANTS
          const resolvedDescendant = extractComponentDescendants({
            returnStatementPath,
            component,
            filepath,
          });

          if (resolvedDescendant) {
            resolvedDescendants.push(resolvedDescendant);
          }
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
                  component.external.props.push(prop.node.key.name);
                } else if (prop.isRestElement()) {
                  // CASE: prop type is a RestElement
                  component.external.props.push(
                    `...${prop.node.argument.name}`,
                  );
                }
              });
              // if the parameter is an identifier (e.g. ref)
            } else if (param.isIdentifier()) {
              component.external.props.push(param.node.name);
            }
          });
        }
        return component;
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

  resolvedDescendants.forEach((resolvedDescendant) => {
    const [desc_key, desc_value] = resolvedDescendant;
    // if descendant was not detected as a top level component
    if (!components[desc_key]) {
      // record it and label it as nested
      components[desc_key] = desc_value;
      components[desc_key].nested = true;
    }
  });

  return components;
}

function extractComponentDescendants({
  returnStatementPath,
  component,
  filepath,
}) {
  const tentativeDescendantsMap = new Map();

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

    // do not treat top-level component as a descendant
    // PREVENTS INFINITE LOOP
    if (tagName === component.name) return false;

    // Only add component-like elements (capitalized, not HTML tags)
    if (tagName && /^[A-Z]/.test(tagName)) {
      // set unresolved descendant to filepath "" temporarily
      // (this tentative map gets resolved in build-schema.js)
      tentativeDescendantsMap.set(tagName, "");

      // check whether descendant is declared in the current filepath
      // (if so, resolve filepath here instead of in build-schema.js)
      const elementBinding = elementPath.scope.getBinding(tagName);

      // if descendant is not declared anywhere, it could be global or unresolved
      // Failed: could not resolve descendant within this filepath
      if (!elementBinding) return false;

      const bindingPath = elementBinding.path;
      if (bindingPath) {
        if (
          bindingPath.isFunctionDeclaration() ||
          bindingPath.isVariableDeclarator()
        ) {
          // parse descendant
          const declaration = bindingPath.isVariableDeclarator()
            ? bindingPath.parentPath
            : bindingPath;
          const declarations = collectTopLevelDeclarations([declaration]);
          const descendants = parseReactComponents(
            [
              ...declarations.constants,
              ...declarations.regular_constants,
              ...declarations.functions,
              ...declarations.regular_functions,
            ],
            filepath,
          );
          if (descendants[`${tagName}::${filepath}`]) {
            // Success: resolved descendant
            // remove resolved descendant from tentative Map
            tentativeDescendantsMap.delete(tagName);
            // add UID to component.descendants
            component.descendants.push(`${tagName}::${filepath}`);
            // add the parsed descendant to resolvedDescendants
            const resolvedDescendant = Object.entries(descendants)[0];
            return resolvedDescendant;
          }
          // Failed: could not resolve descendant within this filepath
          return false;
        }
      }
    }
  }

  let result = "";
  //EXTRACT component descendants
  // When return is <Jsx/>
  if (returnStatementPath.isJSXElement()) {
    result = handleJSXElement(returnStatementPath);

    // And contains JSX
    returnStatementPath.traverse({
      JSXElement(elementPath) {
        handleJSXElement(elementPath);
      },
    });
  } else {
    // When return contains JSX
    returnStatementPath.traverse({
      JSXElement(elementPath) {
        result = handleJSXElement(elementPath);
      },
    });
  }
  component.unresolvedDescendants = tentativeDescendantsMap;
  return result;
}

module.exports = parseReactComponents;
