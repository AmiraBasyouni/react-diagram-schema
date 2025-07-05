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
    const program_body = path.node.body;

    // helper function to extract React components from the program
    const isReactComponent = (node) =>
      node.type === "FunctionDeclaration" && /^[A-Z]/.test(node.id.name);

    //REACT-COMPONENTS
    const components = program_body.filter(isReactComponent);

    //EXTRACT { name: "", internal: {states: [], functions: []}, location: null } FROM EACH REACT COMPONENT
    components.forEach((component) => {
      const obj = {
        name: "",
        description: "",
        internal: { states: [], functions: [] },
        external: { props: [], context: [], constants: [] },
        location: null,
      };

      //--INTERNAL STRUCTURE -----------------------------

      //EXTRACT name AND location
      obj.name = component.id.name;
      obj.location = component.loc;

      //EXTRACT internal functions -> [ "func1", "func2", ... ]
      obj.internal.functions = component.body.body
        .filter((node) => node.type === "FunctionDeclaration")
        .map((fn) => fn.id?.name) // access name if it exists
        .filter(Boolean); // filter out any undefined or null names

      // helper variable that extracts VariableDeclarations from a React component
      const component_VarDeclarations = component.body.body.filter(
        (node) => node.type === "VariableDeclaration",
      );

      // helper functions to verify node path and state variable
      const isValidPath = (node) =>
        node.type === "VariableDeclarator" &&
        node.init.type === "CallExpression";
      const isStateVariable = (node, reactHook) => {
        if (node.init.callee.type === "Identifier") {
          return node.init.callee.name === reactHook; // useState | useContext
        } else if (node.init.callee.type === "MemberExpression") {
          return node.init.callee.property.name === reactHook; // useState | useContext
        } else {
          return false;
        }
      };
      // helper variable that stores the extracted state declarators
      const state_declarators = component_VarDeclarations.flatMap(
        (declaration) =>
          declaration.declarations.filter(
            (node) => isValidPath(node) && isStateVariable(node, "useState"),
          ),
      );
      //EXTRACT internal states -> [ ["a", "setA"], ["b", "setB"], ... ]
      const state_values = state_declarators.map((declarator) =>
        declarator.id.elements.map((element) => element.name),
      );
      obj.internal.states = state_values;

      //--EXTERNAL STRUCTURE -----------------------------
      // helper variable: extract component props
      const component_props =
        component.params.length > 0 ? component.params[0].properties : [];

      //EXTRACT PROPS
      obj.external.props = component_props?.map((object) => object.key.name);

      // helper variable to store useContext declarators
      const context_declarators = component_VarDeclarations.flatMap(
        (declaration) =>
          declaration.declarations.filter(
            (node) => isValidPath(node) && isStateVariable(node, "useContext"),
          ),
      );
      //EXTRACT external context `source` and `values` -> [{ source: "ContextName", values: [value1, value2, ...]}, ....]
      const context = [];
      context_declarators.forEach((declarator) => {
        const source = declarator.init.arguments[0].name;
        const values = [];
        if (declarator.id.type === "Identifier") {
          values.push(declarator.id.name);
        } else if (declarator.id.type === "ObjectPattern") {
          declarator.id.properties.forEach((objectProperty) =>
            values.push(objectProperty.key.name),
          );
        }
        context.push({ source, values });
      });
      obj.external.context = context;

      // APPEND COMPONENT-LOGIC TO SCHEMA
      schema.components.push(obj);
    });
  },
});

// OUTPUT DEBUGGER!!
//console.dir(schema, { depth: null, colors: true });

generateSchemaFile(schema);
