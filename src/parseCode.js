// imports
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const isInlineReactComponent = require("./utils/isInlineReactComponent");
const isFunctionDefinedReactComponent = require("./utils/isFunctionDefinedReactComponent");
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

      // ---- support-exported components -----------------------------------------------------------------
      // helper function: filter export declarations
      const isExportDeclaration = (path) =>
        path.isExportDefaultDeclaration || path.isExportNamedDeclaration;

      //EXTRACT export declarations
      const exportDeclarationPaths =
        program_bodyPath.filter(isExportDeclaration);

      // ---- inline-defined components -----------------------------------------------------------------

      //EXTRACT inline REACT-COMPONENTS
      const inlineComponentDeclarationPaths = program_bodyPath.filter(
        isInlineReactComponent,
      );
      const inlineComponentDeclaratorPaths =
        inlineComponentDeclarationPaths.map(
          (declaration) => declaration.get("declarations")[0],
        );

      //EXTRACT inline export declarations
      const exportVariableDeclarationPaths = exportDeclarationPaths
        .map((exportDeclaration) => exportDeclaration.get("declaration"))
        .filter(isInlineReactComponent);
      const exportVariableDeclaratorPaths = exportVariableDeclarationPaths.map(
        (declaration) => declaration.get("declarations")[0],
      );

      //MERGE exports WITH normal inline declarations
      exportVariableDeclaratorPaths.forEach((exportVariable) =>
        inlineComponentDeclaratorPaths.push(exportVariable),
      );

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

      // ---- function-defined components -----------------------------------------------------------------
      /*      // helper function: filter function-defined React declarations
      const isFunctionDefinedReactComponent = (path) =>
        path.isFunctionDeclaration() && /^[A-Z]/.test(path.node.id.name);
*/
      //EXTRACT function-defined REACT COMPONENTS
      const functionDefinedComponentPaths = program_bodyPath.filter(
        isFunctionDefinedReactComponent,
      );

      //EXTRACT exported function-defined REACT COMPONENTS
      const exportFunctionDeclarationPaths = exportDeclarationPaths
        .map((exportDeclaration) => exportDeclaration.get("declaration"))
        .filter(isFunctionDefinedReactComponent);

      //MERGE exports WITH normal function-defined declarations
      exportFunctionDeclarationPaths.forEach((exportFunction) =>
        functionDefinedComponentPaths.push(exportFunction),
      );

      //EXTRACT metadata FROM function-defined COMPONENTS
      const metadataDefined = extractMetadata(
        functionDefinedComponentPaths,
        "defined",
        code,
        filepath,
      );
      //APPEND COMPONENT-LOGIC TO SCHEMA
      metadataDefined.forEach(
        (obj) => (components[`${obj.name}::${obj.location.filepath}`] = obj),
      );
    },
  });
  return components;
}

module.exports = parseCode;
