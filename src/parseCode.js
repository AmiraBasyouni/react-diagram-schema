// imports
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const extractMetadata = require("./utils/extractMetadata");
const sortPaths = require("./utils/sortPaths");

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

      const {
        variableDeclaratorPaths,
        reactVariableDeclaratorPaths,
        reactFunctionDeclarationPaths,
        reactDefaultExportDeclarationPaths,
        reactAnonymousDeclarationPaths,
        reactClassDeclarationPaths,
      } = sortPaths(program_bodyPath);

      //APPEND const Component = as TO SCHEMA
      variableDeclaratorPaths.map((declarator) => {
        const name = declarator.node.id.name;
        const init = declarator.get("init");
        const identifier = init.isMemberExpression()
          ? init.node.object.name
          : init.node.name;
        const location = {
          line: declarator.node?.loc.start.line,
          filepath,
        };

        components[`${name}::${filepath}`] = {
          name,
          description: "",
          descendants: [],
          internal: { states: [], functions: [] },
          external: { props: [], context: [], constants: [] },
          defaultExport: false,
          location,
          unresolvedDescendants: [],
          unresolvedInitializer: identifier,
        };
      });

      //APPEND class Component extends React.Component{} TO SCHEMA
      reactClassDeclarationPaths.map((declarator) => {
        const name = declarator.node.id.name;
        const location = {
          line: declarator.node?.loc.start.line,
          filepath,
        };
        components[`${name}::${filepath}`] = {
          name,
          description: "",
          type: "class",
          descendants: [],
          internal: { states: [], functions: [] },
          external: { props: [], context: [], constants: [] },
          defaultExport: false,
          location,
          unresolvedDescendants: [],
        };
      });

      // ----------------------------------------------------------------------
      //EXTRACT metadata { name: "", internal: {states: [], functions: []}, location: null } FROM EACH inline REACT COMPONENT
      const metadata = extractMetadata(
        reactVariableDeclaratorPaths,
        "inline",
        code,
        filepath,
      );

      // ----------------------------------------------------------------------
      //APPEND COMPONENT-LOGIC TO SCHEMA (inline React components)
      metadata.forEach(
        (obj) => (components[`${obj.name}::${obj.location.filepath}`] = obj),
      );

      // ----------------------------------------------------------------------
      //EXTRACT metadata FROM function-defined COMPONENTS
      const metadataDefined = extractMetadata(
        reactFunctionDeclarationPaths,
        "defined",
        code,
        filepath,
      );
      const isDefaultExport_true = true;
      //EXTRACT metadata FROM export default COMPONENTS
      const metadataDefault = extractMetadata(
        reactDefaultExportDeclarationPaths,
        "defined",
        code,
        filepath,
        isDefaultExport_true,
      );

      //MERGE export default declaration with named declarations
      metadataDefault.forEach((f) => metadataDefined.push(f));
      //APPEND COMPONENT-LOGIC TO SCHEMA
      metadataDefined.forEach(
        (obj) => (components[`${obj.name}::${obj.location.filepath}`] = obj),
      );

      // ----------------------------------------------------------------------
      const metadataAnonymous = extractMetadata(
        reactAnonymousDeclarationPaths,
        "defined",
        code,
        filepath,
        isDefaultExport_true,
      );
      metadataAnonymous.forEach(
        (obj) => (components[`::${obj.location.filepath}`] = obj),
      );
    },
  });
  return components;
}

module.exports = parseCode;
