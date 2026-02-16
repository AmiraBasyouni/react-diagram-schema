/* (parseImport.test.js) Objective: test coverage for ./src/parseImport.js */

const parseFile = require("../src/parseFile");
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
  ];
  testCases.forEach(({ testName, code, target_specifier, expecting }) => {
    test(String(testName), () => {
      const topLevelDeclarations = parseFile(code);
      const result = parseImport(
        topLevelDeclarations.imports,
        target_specifier,
      );
      expect(result).toEqual(expecting);
    });
  });
});
