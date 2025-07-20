// imports
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const componentIsDeclaredInCode = require("./utils/componentIsDeclaredInCode");

/* Build the following schema structure
 *
 * const components = {
 *   ComponentName:
 *     {
 *       name: ""
 *       internal: { states: [], functions: [], },
 *       external: { props: [], context: [], constants: [] },
 *       location: {line, filepath}
 *     }
 * };
 *
 */

/* A TEST-COMPONENT FOR DEBUGGING CODE PARSER!!
const code = `function MyComponent({ children, propA, propB, propC }) {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = React.useState("");
  const favouriteColor = React.useContext(FavouriteColorContext);
  const {theme1, theme2} = React.useContext(FavouriteTheme);
  function A(){}
  function B(){function C(){}}
  return <div>{count}</div>;
}
`;
*/

function parseCode(code, filepath) {
  // schema setup
  const components = [];

  // ast @babel/parser
  const ast = parser.parse(code, {
    plugins: ["jsx", "typescript"],
    sourceType: "module",
  });

  // ast @babel/traverse
  traverse(ast, {
    // In every parsed file, the top-level node of the AST is always a program node
    // There is only one program per file
    Program(path) {
      const program_bodyPath = path.get("body");

      /* include support for in-line function declarations (e.g. const ComponentName = () => ...) */
      //const isInlineReactComponent = (path) =>
      //  path.get("declarations")[0]?.init.type === "ArrowFunctionExpression" &&
      //  /^[A-Z]/.test(path.node.id.name);

      // helper function: filter to select React components in the program
      const isReactComponent = (path) =>
        path.isFunctionDeclaration() && /^[A-Z]/.test(path.node.id.name);

      //EXTRACT REACT-COMPONENTS
      const componentPaths = program_bodyPath.filter(isReactComponent);
      /* extract in-line React Components */
      //const inlineComponentPaths = program_bodyPath.filter(
      //  isInlineReactComponent,
      //);

      //EXTRACT { name: "", internal: {states: [], functions: []}, location: null } FROM EACH REACT COMPONENT
      componentPaths.forEach((componentPath) => {
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

        //EXTRACT internal functions from a React Component -> [ "func1", "func2", ... ]
        obj.internal.functions = componentPath
          .get("body")
          .get("body")
          .filter((path) => path.isFunctionDeclaration())
          .map((fn) => fn.node.id?.name) // access name if it exists
          .filter(Boolean); // filter out any undefined or null names

        // helper variable: extract VariableDeclarations from a React component
        const component_VarDeclarations = componentPath
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
        // helper variable: filter component props from a component's parameter list
        const component_props =
          componentPath.node.params.length > 0
            ? componentPath.node.params[0].properties
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
        const component_returnStatementPath = componentPath
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
        //obj.descendants = Array.from(descendantsMap.entries()).map(
        //  ([name, metadata]) => ({ name, ...metadata }),
        //);

        //APPEND COMPONENT-LOGIC TO SCHEMA
        components.push(obj);
      });
    },
  });
  return components;
}

module.exports = parseCode;
