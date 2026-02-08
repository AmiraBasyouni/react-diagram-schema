// parseFile.test.js
// Goal: Validate that file is correctly parsed
// Cases Covered: imports, exports, constants, functions, classes
const parseFile = require("../src/parseFile");

describe("parseFile", () => {
  // START of imports
  describe("extracts imports", () => {
    // test 1
    test("ImportDefaultSpecifier", () => {
      const code = `import React from "react";`;
      const result = parseFile(code);
      const imports = result.imports.map(
        ({ specifier }) => specifier.node.local.name,
      );
      expect(imports).toEqual(["React"]);
    });
    // test 2
    test("2x ImportSpecifiers", () => {
      const code = `import {Button, Icon} from "@specialPath";`;
      const result = parseFile(code);
      const imports = result.imports.map(
        ({ specifier }) => specifier.node.local.name,
      );
      expect(imports).toEqual(["Button", "Icon"]);
    });
    // test 3
    test("1x ImportDefaultSpecifier and 2x ImportSpecifiers", () => {
      const code = `import MyDefault, { NamedExport1, NamedExport2 } from './my-module.js';`;
      const result = parseFile(code);
      const imports = result.imports.map(
        ({ specifier }) => specifier.node.local.name,
      );
      expect(imports).toEqual(["MyDefault", "NamedExport1", "NamedExport2"]);
    });
    // test 4
    test("ImportSpecifier { default as MyComponent}", () => {
      const code = `import { default as MyComponent } from "./my-module.js";`;
      const result = parseFile(code);
      const imports = result.imports.map(
        ({ specifier }) => specifier.node.local.name,
      );
      expect(imports).toEqual(["MyComponent"]);
    });
  }); // END of imports

  // START of exports
  describe("extracts exports", () => {
    // test 1
    test("default export", () => {
      const code = `export default ()=> <Hi/>`;
      const result = parseFile(code);
      const exports = result.exports.map(
        ({ declaration }) => declaration.node.type,
      );
      expect(exports).toContain("ArrowFunctionExpression");
    });
    // test 2
    test("constant", () => {
      const code = `export const ComponentName = <HI/>`;
      const result = parseFile(code);
      const exports = result.exports.map(
        ({ declaration }) => declaration.node.type,
      );
      expect(exports).toContain("VariableDeclaration");
    });
    // test 3
    test("function", () => {
      const code = `export function ThereAgain(){}`;
      const result = parseFile(code);
      const exports = result.exports.map(
        ({ declaration }) => declaration.node.type,
      );
      expect(exports).toContain("FunctionDeclaration");
    });
  }); // END of exports

  // START of constants
  describe("extracts constants", () => {
    // test 1
    test("CallExpression", () => {
      const code = `const App = forwardRef(()=>{})`;
      const result = parseFile(code);
      const constants = result.constants.map(
        ({ declarator }) => declarator.node.id.name,
      );
      expect(constants).toContain("App");
    });
    // test 2
    test("ArrowFunctionExpression with bodyStatement", () => {
      const code = `const App = ()=>{}`;
      const result = parseFile(code);
      const constants = result.constants.map(
        ({ declarator }) => declarator.node.id.name,
      );
      expect(constants).toContain("App");
    });
    // test 3
    test("ArrowFunctionExpression without bodyStatement", () => {
      const code = `const App = ()=><div></div>`;
      const result = parseFile(code);
      const constants = result.constants.map(
        ({ declarator }) => declarator.node.id.name,
      );
      expect(constants).toContain("App");
    });
  }); // END of constants
});
