// imports
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const isInlineReactComponent = require("./utils/isInlineReactComponent");
const isFunctionDefinedReactComponent = require("./utils/isFunctionDefinedReactComponent");
//const extract_exportDeclarationPaths = require("./utils/extract_exportDeclarationPaths");
const extract_exportVariableDeclaratorPaths = require("./utils/extract_exportVariableDeclaratorPaths");
const extract_exportFunctionDeclarationPaths = require("./utils/extract_exportFunctionDeclarationPaths");
const extractMetadata = require("./utils/extractMetadata");
const handleProviders = require("./utils/handleProviders");

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
      //EXTRACT exported (default and named) declarations
      const exportDeclarationPaths = program_bodyPath.filter(
        (path) =>
          path.isExportDefaultDeclaration || path.isExportNamedDeclaration,
      );
      // ---- inline-defined components -----------------------------------------------------------------

      //EXTRACT variable declared REACT-COMPONENTS (e.g. const Button = ...)
      const inlineComponentDeclarationPaths = program_bodyPath.filter((p) =>
        isInlineReactComponent(p),
      );
      const inlineComponentDeclaratorPaths =
        inlineComponentDeclarationPaths.map(
          (declaration) => declaration.get("declarations")[0],
        );

      //EXTRACT variable declared export declarations (e.g. export const Button = ...)
      const exportVariableDeclaratorPaths =
        extract_exportVariableDeclaratorPaths(exportDeclarationPaths);

      /*
      //EXTRACT provider
      const varDeclarators = program_bodyPath
        .filter((path) => path.isVariableDeclaration())
        .map((decl) => decl.get("declarations")[0])
        .filter((p) => p.isVariableDeclarator())
        .filter((declarator) => declarator.get("init").isMemberExpression);
      const exportVarDeclarators = exportDeclarationPaths
        .filter((path) => path.get("declaration").isVariableDeclaration())
        .map((p) => p.get("declaration").get("declarations")[0])
        .filter((p) => p.isVariableDeclarator())
        .filter((declarator) => declarator.get("init").isMemberExpression);
      const providers = handleProviders(
        [...varDeclarators, ...exportVarDeclarators],
        filepath,
      );
      providers.forEach(
        (provider) =>
          (components[`${provider.name}::${provider.location.filepath}`] =
            provider),
      );
      */

      //MERGE variable declared exports WITH variable declared react components
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
      //EXTRACT function-defined REACT COMPONENTS
      const functionDefinedComponentPaths = program_bodyPath.filter((p) =>
        isFunctionDefinedReactComponent(p),
      );

      //EXTRACT export named function declaration REACT COMPONENTS
      const exportFunctionDeclarationPaths =
        extract_exportFunctionDeclarationPaths(exportDeclarationPaths);
      //EXTRACT export default declaration REACT COMPONENTS
      const isDefaultExport_true = true;
      const exportDefaultDeclarationPaths =
        extract_exportFunctionDeclarationPaths(
          exportDeclarationPaths,
          isDefaultExport_true,
        );

      //MERGE named exports WITH normal function-defined declarations
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
      //EXTRACT metadata FROM export default COMPONENTS
      const metadataDefault = extractMetadata(
        exportDefaultDeclarationPaths,
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

      //EXTRACT anonymous inline default export REACT COMPONENTS (e.g. export default () => <></>)
      const exportDefaultAnonymousDeclarationPath = exportDeclarationPaths
        .filter(
          (path) =>
            path.isExportDefaultDeclaration() &&
            path.node.declaration?.type === "ArrowFunctionExpression",
        )
        .map((path) => path.get("declaration"));
      const metadataAnonymous = extractMetadata(
        exportDefaultAnonymousDeclarationPath,
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
