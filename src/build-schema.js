#!/usr/bin/env node

// imports
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const readSourceFile = require("./readSourceFile");
const generateSchemaFile = require("./generateSchema");

// project setup
const inputFile = process.argv[2];
const { code, filename } = readSourceFile(inputFile);

const schema = {
  filename,
  components: [],
};

/* Build a schema with the following structure
 *
 * const schema = {
 *   filename: "fileName.js"
 *   components: [
 *     {
 *       name: "",
 *       internal: { states: [], functions: [], },
 *       external: { props: [], context: [], constants: [] },
 *       location: null
 *     }
 *   ]
 * };
 */

/* CODE DEBUGGER!!
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

    // helper function: filter to select React components in the program
    const isReactComponent = (path) =>
      path.isFunctionDeclaration() && /^[A-Z]/.test(path.node.id.name);

    //EXTRACT REACT-COMPONENTS
    const componentsPath = program_bodyPath.filter(isReactComponent);

    //EXTRACT { name: "", internal: {states: [], functions: []}, location: null } FROM EACH REACT COMPONENT
    componentsPath.forEach((componentPath) => {
      const obj = {
        name: "",
        description: "",
        internal: { states: [], functions: [] },
        external: { props: [], context: [], constants: [] },
        location: null,
      };

      //--INTERNAL STRUCTURE -----------------------------

      //EXTRACT name AND location
      obj.name = componentPath.node.id.name;
      obj.location = componentPath.node.loc;

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
              (path) => isValidPath(path) && isStateVariable(path, "useState"),
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
      obj.external.props = component_props?.map((object) => object.key.name);

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

      //APPEND COMPONENT-LOGIC TO SCHEMA
      schema.components.push(obj);
    });
  },
});

// OUTPUT TO CONSOLE!!
console.dir(schema, { depth: null, colors: true });

// OUTPUT TO FILE
//generateSchemaFile(schema);
