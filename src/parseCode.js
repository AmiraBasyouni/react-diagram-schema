// imports
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const getInlineComponentDeclaratorPaths = require("./utils/getInlineComponentDeclaratorPaths");
const extractMetadata = require("./utils/extractMetadata.js");

/* Build the following schema structure
 *
 * const components = [
 *     {
 *       name: ""
 *       internal: { states: [], functions: [], },
 *       external: { props: [], context: [], constants: [] },
 *       location: {line, filepath}
 *     }
 * ];
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
  const components = {};

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

      // ---- inline-defined components -----------------------------------------------------------------
      //EXTRACT inline REACT-COMPONENTS
      const inlineComponentDeclaratorPaths =
        getInlineComponentDeclaratorPaths(program_bodyPath);
      //EXTRACT metadata { name: "", internal: {states: [], functions: []}, location: null } FROM EACH inline REACT COMPONENT
      const metadata = extractMetadata(
        inlineComponentDeclaratorPaths,
        "inline",
        code,
        filepath,
      );

      //APPEND COMPONENT-LOGIC TO SCHEMA (inline React components)
      metadata.forEach(
        (obj) => (components[`${obj.name}::${obj.location.filepath}`] = obj),
      );

      /* function-defined components */
      // helper function: filter function declarations to select React function-defined components
      const isReactComponent = (path) =>
        path.isFunctionDeclaration() && /^[A-Z]/.test(path.node.id.name);
      //EXTRACT REACT-COMPONENTS
      /* extract function-defined components*/
      const componentPaths = program_bodyPath.filter(isReactComponent);

      /* extract metadata from function-defined components */
      const metadataDefined = extractMetadata(
        componentPaths,
        "defined",
        code,
        filepath,
      );
      metadataDefined.forEach(
        (obj) => (components[`${obj.name}::${obj.location.filepath}`] = obj),
      );
    },
  });
  return components;
}

module.exports = parseCode;
