#!/usr/bin/env node

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
//const t = require("@babel/types");

const schema = [];

/* Schema should end up looking like the following
 *
 * const schema = {
 *   name: "",
 *   internal: { states: [], functions: [], },
 *   external: { variables: [], functions: []},
 *   location: null };
 *
 * currently, I have ommited external for simplicity
 * but ultimately, external also needs to be implemented
 */

const code = `function MyComponent() {
  const [count, setCount] = useState(0);
  const [time, setTime] = useState(0);
  function A(){}
  function B(){function C(){}}
  return <div>{count}</div>;
}
`;

const ast = parser.parse(code, {
  plugins: ["jsx", "typescript"],
  sourceType: "module",
});

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
        internal: { states: [], functions: [] },
        location: null,
      };

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
      // helper function that extracts state VariableDeclarators from a VariableDeclaration
      const isStateVariable = (node) =>
        node.type === "VariableDeclarator" &&
        node.init.type === "CallExpression" &&
        node.init.callee.name === "useState";
      // helper variable that stores the extracted state declarators
      const state_declarators = component_VarDeclarations.flatMap(
        (declaration) => declaration.declarations.filter(isStateVariable),
      );
      //EXTRACT internal states -> [ ["a", "setA"], ["b", "setB"], ... ]
      const state_values = state_declarators.map((declarator) =>
        declarator.id.elements.map((element) => element.name),
      );
      obj.internal.states = state_values;

      // APPEND COMPONENT-LOGIC TO SCHEMA
      schema.push(obj);
    });

    // const customHooks = program_body.filter(
    // (node) =>
    // node.type === "FunctionDeclaration" &&
    // /^use[A-Z0-9].*/.test(node.id.name),
    // );

    //console.log(t.isFunctionDeclaration(components));
  },
});

console.dir(schema, { depth: null, colors: true });
