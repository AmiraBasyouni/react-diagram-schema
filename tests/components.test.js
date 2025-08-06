// function + inline + multi-component tests
const parseCode = require("../src/parseCode");

describe("Component Parsing", () => {
  /* function-defined component */
  test("parses a function-defined component", () => {
    const fakePath = "../fake/MyComponent.js";
    const code = `
      function MyComponent() {
        return <h1>Hello</h1>;
      }
    `;

    const result = parseCode(code, fakePath);

    // Expect one component key in the object
    const keys = Object.keys(result);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe(`MyComponent::${fakePath}`);

    // Validate structure
    const component = result[keys[0]];
    expect(component.name).toBe("MyComponent");
    expect(component.internal).toEqual({ states: [], functions: [] });
    expect(component.external).toEqual({
      props: [],
      context: [],
      constants: [],
    });
    expect(component.location).toHaveProperty("line");
    expect(component.location).toHaveProperty("filepath", fakePath);
  });

  /* inline arrow function component */
  test("parses an inline arrow function component", () => {
    const fakePath = "../fake/MyComponent.js";
    const code = `
      const MyComponent = () => <div>Hello</div>;
    `;

    const result = parseCode(code, fakePath);

    const keys = Object.keys(result);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe(`MyComponent::${fakePath}`);

    const component = result[keys[0]];
    expect(component.name).toBe("MyComponent");
    expect(component.internal).toEqual({ states: [], functions: [] });
    expect(component.external).toEqual({
      props: [],
      context: [],
      constants: [],
    });
    expect(component.location).toHaveProperty("line");
    expect(component.location).toHaveProperty("filepath", fakePath);
  });

  /* function-defined and inline arrow function component */
  test("parses multiple components in one file", () => {
    const fakePath = "../fake/Multi.js";
    const code = `
      function App() {
        return <Header />;
      }
      const Header = () => <h1>Header</h1>;
    `;

    const result = parseCode(code, fakePath);

    const keys = Object.keys(result);
    expect(keys).toHaveLength(2);
    expect(keys).toContain(`App::${fakePath}`);
    expect(keys).toContain(`Header::${fakePath}`);
  });
});
