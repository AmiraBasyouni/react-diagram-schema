// file: unresolvedDescendants.test.js
// goal: collects unresolved descendants

const {
  functionCases,
  exportCases,
  defaultExportCases,
} = require("./cases/unresolvedDescendants.cases.js");

const getParsedCode = require("../src/getParsedCode");
const getComponents = require("../src/getComponents");

// resolved descendants format: ["tagNameA::filePath", "tagNameB::filePath", ...]
// unresolved descendants format: Map (tagName => filePath)
describe("(functions) Identify unresolved descendants", () => {
  check(functionCases);
});
describe("(exports) Identify unresolved descendants", () => {
  check(exportCases);
});
describe("(export defaults) Identify unresolved descendants", () => {
  check(defaultExportCases);
});

function check(cases) {
  cases.forEach((testCase) => {
    const { name, code, expected } = testCase;
    const fakePath = "../fake/Component.js";
    test(name, () => {
      const parsedCode = getParsedCode(code);
      // component objects
      const components = Object.values(getComponents(parsedCode, fakePath));
      // for each component object, check that component exists
      expect(components.map((component) => component.name)).toEqual(
        expected.components,
      );
      // for each component object, check that descendants were parsed
      components.forEach((component) => {
        component.descendants.forEach((descendant) => {
          const expected_descendants =
            expected?.descendants[component.name] + `::${fakePath}`;
          expect(descendant).toEqual(expected_descendants);
        });
        const expected_unresolvedDescendants =
          expected.unresolvedDescendants &&
          expected.unresolvedDescendants[component.name]
            ? expected.unresolvedDescendants[component.name]
            : [];
        const unresolvedDescendants = Array.from(
          component.unresolvedDescendants.keys(),
        );
        expect(unresolvedDescendants).toEqual(expected_unresolvedDescendants);
      });
    });
  });
}
