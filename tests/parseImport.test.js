/* (parseImport.test.js) Objective: test coverage for ./src/parseImport.js */

const parseImport = require("../src/parseImport");

describe("parseImport", () => {
  const testCases = [
    {
      name: "default import",
      code: `import Button from './Button';`,
      target: "Button",
      expected: "./Button",
    },
    {
      name: "named import",
      code: `import { Card } from './Card';`,
      target: "Card",
      expected: "./Card",
    },
    {
      name: "irrelevant import",
      code: `import Something from './Else';`,
      target: "NotThere",
      expected: null,
    },
    {
      name: "multiple imports, find second",
      code: `
      import { X } from './X';
      import { Y } from './Y';
    `,
      target: "Y",
      expected: "./Y",
    },
  ];
  testCases.forEach(({ name, code, target, expected }) => {
    test(String(name), () => {
      const result = parseImport(code, target);
      expect(result).toBe(expected);
    });
  });
});
