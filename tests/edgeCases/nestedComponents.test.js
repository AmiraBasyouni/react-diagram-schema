// file: edgeCases/nestedComponents.test.js
// goal: handle tricky structures

const cases = require("./cases/nestedComponents.cases.js");

const getParsedCode = require("../../src/getParsedCode");
const getComponents = require("../../src/getComponents");

// resolved descendants format: ["tagNameA::filePath", "tagNameB::filePath", ...]
// unresolved descendants format: Map (tagName => filePath)

describe("Nested Components", () => {
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
  /*
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
    expect(component.unresolvedDescendants.has("Section")).toEqual(true);
    console.log(result);
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
    expect(component.unresolvedDescendants.has("Section")).toEqual(true);
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
  */
});
