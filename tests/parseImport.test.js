/* (parseImport.test.js) Objective: test coverage for ./src/parseImport.js */

//const fs = require("fs");
//const path = require("path");
const parseImport = require("../src/parseImport");

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

for (const { name, code, target, expected } of testCases) {
  const result = parseImport(code, target);
  const pass = result === expected ? "✅" : "❌";
  console.log(`${pass} ${name} — expected: ${expected}, got: ${result}`);
}
