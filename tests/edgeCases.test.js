// edgeCases.test.js
// Goal: Handle tricky structures like nested components, default exports, and files with missing metadata.
const getParsedCode = require("../src/getParsedCode");
//const verifyReactComponents = require("../src/verifyReactComponents");
//const parseReactComponents = require("../src/parseReactComponents");
const getComponents = require("../src/getComponents");

describe("Edge Cases", () => {
  describe("Nested Components", () => {
    test("Extract Component nested in component factory", () => {
      const fakePath = "../fake/Component.js";
      const code = `const Component = memo(NestedComponent)`;
      const parsedCode = getParsedCode(code);
      const result = getComponents(parsedCode, fakePath);
      const component = result[`Component::${fakePath}`];
      expect(component.name).toEqual("Component");
    });
    test("Extract Descendant nested in a conditional JS Expression", () => {
      const fakePath = "../fake/Component.js";
      const code = `function Component(){ return <>{ condition && <HomePage /> }</> }`;
      const parsedCode = getParsedCode(code);
      const result = getComponents(parsedCode, fakePath);
      const component = result[`Component::${fakePath}`];
      expect(component.unresolvedDescendants.has("HomePage")).toEqual(true);
    });
    test("Extract Descendant nested in a map within a JS Expression: identifier", () => {
      const fakePath = "../fake/Component.js";
      const code = `function Component(){ 
	return <>
	    { SECTION.map(({id, component})=> {
	      const Section = component; 
	      return <Section id={id}/>
	    }) }
	</>
      }`;
      const parsedCode = getParsedCode(code);
      const result = getComponents(parsedCode, fakePath);
      const component = result[`Component::${fakePath}`];
      expect(component.descendants.includes(`Section::${fakePath}`)).toEqual(
        true,
      );
      expect(result[`Section::${fakePath}`]).toBeTruthy();
    });
    test("Extract Descendant nested in a map within a JS Expression: MemberExpression", () => {
      const fakePath = "../fake/Component.js";
      const code = `function Component(){ 
	return <>
	    { SECTION.map((section)=> {
	      const Section = section.component; 
	      const Section2 = () => <Hello/>
	      return <Section id={section.id}/>
	    }) }
	</>
      }`;
      const parsedCode = getParsedCode(code);
      const result = getComponents(parsedCode, fakePath);
      const component = result[`Component::${fakePath}`];
      expect(component.descendants.includes(`Section::${fakePath}`)).toEqual(
        true,
      );
    });

    test("component with a nested inline component is detected and marked as nested", () => {
      const fakePath = "../fake/NestedStructure.js";
      const code = `function NestedStructure() {
        const Wrapper = () => <div>Nested component</div>;
        return <Wrapper />;
       }`;

      const parsedCode = getParsedCode(code);
      const result = getComponents(parsedCode, fakePath);

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

    test("component with a nested function-defined component is detected and marked as nested", () => {
      const fakePath = "../fake/NestedFunctionStructure.js";
      const code = `function ParentComponent() {
        function ChildComponent() {
          return <span>Nested function-defined</span>;
        }

        return <ChildComponent />;
      }`;

      const parsedCode = getParsedCode(code);
      const result = getComponents(parsedCode, fakePath);

      // Assert both components are detected
      expect(Object.keys(result)).toContain(`ParentComponent::${fakePath}`);
      expect(Object.keys(result)).toContain(`ChildComponent::${fakePath}`);

      // Assert nested flag is set
      expect(result[`ChildComponent::${fakePath}`].nested).toBe(true);

      // Assert function is tracked in parent metadata
      const parentFunctions =
        result[`ParentComponent::${fakePath}`].internal.functions;
      expect(parentFunctions).toContain("ChildComponent");
    });
  });

  test("component with no state variables", () => {
    const fakePath = "../fake/NoState.js";
    const code = `
      function NoState() {
        return <span>No state</span>;
      }
    `;

    const parsedCode = getParsedCode(code);
    const result = getComponents(parsedCode, fakePath);
    const component = result[`NoState::${fakePath}`];

    expect(component.internal.states).toEqual([]);
  });

  test("component with no internal function declarations returns an empty functions array", () => {
    const fakePath = "../fake/NoFunctionsComponent.js";
    const code = `
    function NoFunctionsComponent() {
      const title = "No internal functions here";
      return <h1>{title}</h1>;
    }
  `;

    const parsedCode = getParsedCode(code);
    const result = getComponents(parsedCode, fakePath);

    const internalFunctions =
      result[`NoFunctionsComponent::${fakePath}`].internal.functions;
    expect(internalFunctions).toEqual([]);
  });

  test("component with no props", () => {
    const fakePath = "../fake/NoProps.js";
    const code = `
      function NoProps() {
        return <div>No props here</div>;
      }
    `;

    const parsedCode = getParsedCode(code);
    const result = getComponents(parsedCode, fakePath);
    const component = result[`NoProps::${fakePath}`];

    expect(component.external.props).toEqual([]);
  });

  test("component with no context usage", () => {
    const fakePath = "../fake/NoContext.js";
    const code = `
      function NoContext() {
        return <div>No context</div>;
      }
    `;

    const parsedCode = getParsedCode(code);
    const result = getComponents(parsedCode, fakePath);
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

    const parsedCode = getParsedCode(code);
    const result = getComponents(parsedCode, fakePath);
    const component = result[`NoConstants::${fakePath}`];

    expect(component.external.constants).toEqual([]);
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

    const parsedCode = getParsedCode(code);
    const result = getComponents(parsedCode, fakePath);

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

    const parsedCode = getParsedCode(code);
    const result = getComponents(parsedCode, fakePath);

    expect(Object.keys(result)).toContain(`ExportStructure::${fakePath}`);
  });

  test("named export inline component is detected", () => {
    const fakePath = "../fake/NamedExportInline.js";
    const code = `
      export const NamedExportInline = () => {
        return <div>Named export inline component</div>;
      }
    `;

    const parsedCode = getParsedCode(code);
    const result = getComponents(parsedCode, fakePath);

    expect(Object.keys(result)).toContain(`NamedExportInline::${fakePath}`);
  });

  test("anonymous default export inline component is detected", () => {
    const fakePath = "../fake/AnonymousInlineDefault.js";
    const code = `
    export default () => <div>Anonymous inline default export</div>;
  `;

    const parsedCode = getParsedCode(code);
    const result = getComponents(parsedCode, fakePath);

    // Assert component key exists
    expect(Object.keys(result)).toContain(`::${fakePath}`);
  });

  test("anonymous default export function component is detected", () => {
    const fakePath = "../fake/AnonymousFunctionDefault.js";
    const code = `
    export default function () { 
      return <div>Anonymous function default export</div>;
    }
  `;

    const parsedCode = getParsedCode(code);
    const result = getComponents(parsedCode, fakePath);

    // Assert component key exists
    expect(Object.keys(result)).toContain(`::${fakePath}`);
  });
});
