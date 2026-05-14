/* (parseImport.test.js) Objective: test coverage for ./src/parseImport.js */

const getParsedCode = require("../src/getParsedCode");
const parseImport = require("../src/parseImport");

describe("parse import", () => {
  const testCases = [
    {
      testName: "default",
      code: `import Button from "./Button";`,
      target_specifier: "Button",
      expecting: {
        importSource: "./Button",
        localName: "Button",
      },
    },
    {
      testName: "{ specifier }",
      code: `import { Card, Book } from './Card';`,
      target_specifier: "Card",
      expecting: {
        importSource: "./Card",
        localName: "Card",
        importedName: "Card",
      },
    },
    {
      testName: "default in default, { specifier }",
      code: `import Button, { Card } from './Page';`,
      target_specifier: "Button",
      expecting: {
        importSource: "./Page",
        localName: "Button",
      },
    },
    {
      testName: "specifier in default, { specifier }",
      code: `import Button, { Card } from './Page';`,
      target_specifier: "Card",
      expecting: {
        importSource: "./Page",
        localName: "Card",
        importedName: "Card",
      },
    },
    {
      testName: "{ default as specifier }",
      code: `import { default as Form } from './my-module';`,
      target_specifier: "Form",
      expecting: {
        importSource: "./my-module",
        localName: "Form",
        importedName: "default",
      },
    },
    {
      testName: "irrelevant import",
      code: `import Something from './Else';`,
      target_specifier: "NotThere",
      expecting: {},
    },
    {
      testName: "multiple imports, find second",
      code: `
      import { X } from './X';
      import { Y } from './Y';
    `,
      target_specifier: "Y",
      expecting: { importSource: "./Y", localName: "Y", importedName: "Y" },
    },
    {
      testName: "import from node_modules",
      code: `import { Route } from "react-router-dom";`,
      target_specifier: "Route",
      expecting: {
        importSource: "react-router-dom",
        importedName: "Route",
        localName: "Route",
      },
    },
    {
      testName: "import * as specifier",
      code: `import * as Dialogue from "@radix-ui/react-dialogue";`,
      target_specifier: "Dialogue",
      expecting: {
        importSource: "@radix-ui/react-dialogue",
        localName: "Dialogue",
      },
    },
  ];
  testCases.forEach(({ testName, code, target_specifier, expecting }) => {
    test(String(testName), () => {
      const parsedCode = getParsedCode(code);
      const result = parseImport(parsedCode.imports, target_specifier);
      expect(result).toEqual(expecting);
    });
  });
});
