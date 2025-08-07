// edge cases
const parseCode = require("../src/parseCode");

describe("Edge Cases", () => {
  test("component with no props", () => {
    const fakePath = "../fake/NoProps.js";
    const code = `
      function NoProps() {
        return <div>No props here</div>;
      }
    `;

    const result = parseCode(code, fakePath);
    const component = result[`NoProps::${fakePath}`];

    expect(component.external.props).toEqual([]);
  });

  test("component with no state variables", () => {
    const fakePath = "../fake/NoState.js";
    const code = `
      function NoState() {
        return <span>No state</span>;
      }
    `;

    const result = parseCode(code, fakePath);
    const component = result[`NoState::${fakePath}`];

    expect(component.internal.states).toEqual([]);
  });

  test("component with no context usage", () => {
    const fakePath = "../fake/NoContext.js";
    const code = `
      function NoContext() {
        return <div>No context</div>;
      }
    `;

    const result = parseCode(code, fakePath);
    const component = result[`NoContext::${fakePath}`];

    expect(component.external.context).toEqual([]);
  });

  test("component with no constants used", () => {
    const fakePath = "../fake/NoConstants.js";
    const code = `
      function NoConstants() {
        return <div>No constants</div>;
      }
    `;

    const result = parseCode(code, fakePath);
    const component = result[`NoConstants::${fakePath}`];

    expect(component.external.constants).toEqual([]);
  });

  test("component with a nested inline component is detected and marked as nested", () => {
    const fakePath = "../fake/NestedStructure.js";
    const code = `
    function NestedStructure() {
      const Wrapper = () => <div>Nested component</div>;
      return <Wrapper />;
    }
  `;

    const result = parseCode(code, fakePath);

    // Assert both top-level components are detected
    expect(Object.keys(result)).toContain(`NestedStructure::${fakePath}`);
    expect(Object.keys(result)).toContain(`Wrapper::${fakePath}`);

    // Assert nested flag is set
    expect(result[`Wrapper::${fakePath}`].nested).toBe(true);

    // Assert function is also tracked in metadata of parent
    const parentFunctions =
      result[`NestedStructure::${fakePath}`].internal.functions;
    expect(parentFunctions).toContain("Wrapper");
  });
});

// These tests cover all valid cases where a React component definition
// can be directly preceded by the `export` keyword according to the ECMAScript spec.
// Invalid patterns like `export default const MyComponent = () => {...}` are excluded
// because default exports cannot directly declare variables.
// Reference: https://262.ecma-international.org/#prod-ExportDeclaration
describe("Exports", () => {
  test("default export function declaration is detected", () => {
    const fakePath = "../fake/DefaultExportStructure.js";
    const code = `
      export default function DefaultExportStructure() {
        return <div>Default export component</div>;
      }
    `;

    const result = parseCode(code, fakePath);

    expect(Object.keys(result)).toContain(
      `DefaultExportStructure::${fakePath}`,
    );
  });

  test("named export function declaration is detected", () => {
    const fakePath = "../fake/ExportStructure.js";
    const code = `
      export function ExportStructure() {
        return <div>Named export component</div>;
      }
    `;

    const result = parseCode(code, fakePath);

    expect(Object.keys(result)).toContain(`ExportStructure::${fakePath}`);
  });

  test("named export inline component is detected", () => {
    const fakePath = "../fake/NamedExportInline.js";
    const code = `
      export const NamedExportInline = () => {
        return <div>Named export inline component</div>;
      }
    `;

    const result = parseCode(code, fakePath);

    expect(Object.keys(result)).toContain(`NamedExportInline::${fakePath}`);
  });
});
