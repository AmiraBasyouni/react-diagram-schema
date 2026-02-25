// verifyReactComponents.test.js
// Goal: check that Components are correctly validated
// Cases Covered: returns JSXElement, contains a hook, nested in component factory, class extends React.Component
const verifyReactComponents = require("../src/verifyReactComponents");
const parseFile = require("../src/parseFile");
describe("verify react components", () => {
  // indicator 1
  describe("returns JSXElement", () => {
    describe("constants", () => {
      // test 1
      test("arrow function, no block statement", () => {
        const code = `const Component = () => <div></div>`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        expect(verifiedComponents[0].verified).toContain("returns JSXElement");
        expect(verifiedComponents[0].declaration_type).toEqual(
          "VariableDeclaration",
        );
      });
      // test 2
      test("arrow function, with block statement", () => {
        const code = `const Component = () => { return <div></div> }`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        expect(verifiedComponents[0].verified).toContain("returns JSXElement");
        expect(verifiedComponents[0].declaration_type).toEqual(
          "VariableDeclaration",
        );
      });
      // test 3
      test("JSXElement", () => {
        const code = `const Component = <div></div>`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        expect(verifiedComponents[0].verified).toContain("returns JSXElement");
        expect(verifiedComponents[0].declaration_type).toEqual(
          "VariableDeclaration",
        );
      });
    });
    describe("funcitons", () => {
      // functions
      test("{ return <JSX /> }", () => {
        const code = `function Component() { return <div></div> }`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        expect(verifiedComponents[0].verified).toContain("returns JSXElement");
        expect(verifiedComponents[0].declaration_type).toEqual(
          "FunctionDeclaration",
        );
      });
      test("{ if(condition) { return <JSX/> } }", () => {
        const code = `function Component() { if(conditionIsTrue) { return <JSX/> } return null; }`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        expect(verifiedComponents[0].verified).toContain("returns JSXElement");
      });
    });
    // exports
    describe("exports", () => {
      test("export default arrow function", () => {
        const code = `export default () => <JSX/>`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        expect(verifiedComponents[0].verified).toContain("returns JSXElement");
        expect(verifiedComponents[0].declaration_type).toEqual(
          "ArrowFunctionExpression",
        );
      });
      test("export default arrow function with blockStatement", () => {
        const code = `export default () => { return <JSX/> }`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        expect(verifiedComponents[0].verified).toContain("returns JSXElement");
        expect(verifiedComponents[0].declaration_type).toEqual(
          "ArrowFunctionExpression",
        );
      });
      test("export default function", () => {
        const code = `export default function(){ return <JSX/> }`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        expect(verifiedComponents[0].verified).toContain("returns JSXElement");
        expect(verifiedComponents[0].declaration_type).toEqual(
          "FunctionDeclaration",
        );
      });
    });
  });
  // indicator 2
  describe("is nested in component factory", () => {
    test("CallExpression", () => {
      const code = `const Component = forwardRef(() => <div></div>)`;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      expect(verifiedComponents[0].verified).toContain(
        "is nested in component factory",
      );
      expect(verifiedComponents[0].declaration_type).toEqual(
        "VariableDeclaration",
      );
    });
  });
  // indicator 3
  describe("class extends react", () => {
    // test 1
    test("extends React.Component", () => {
      const code = `
	class Car extends React.Component {
	  constructor() {
	  super();
	  this.state = { color: "red" };
	  }
	  render() {
	  return <h2>I am a {this.state.color} Car!</h2>;
	  }
	}
	`;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      expect(verifiedComponents[0].verified).toContain("class extends react");
      expect(verifiedComponents[0].declaration_type).toEqual(
        "ClassDeclaration",
      );
    });
    // test 2
    test("extends Component", () => {
      const code = `
	class Car extends Component {
	  constructor() {
	  super();
	  this.state = { color: "red" };
	  }
	  render() {
	  return <h2>I am a {this.state.color} Car!</h2>;
	  }
	}
	`;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      expect(verifiedComponents[0].verified).toContain("class extends react");
      expect(verifiedComponents[0].declaration_type).toEqual(
        "ClassDeclaration",
      );
    });
    // test 3
    test("extends React.PureComponent", () => {
      const code = `
	class Car extends React.PureComponent {
	  constructor() {
	  super();
	  this.state = { color: "red" };
	  }
	  render() {
	  return <h2>I am a {this.state.color} Car!</h2>;
	  }
	}
	`;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      expect(verifiedComponents[0].verified).toContain("class extends react");
      expect(verifiedComponents[0].declaration_type).toEqual(
        "ClassDeclaration",
      );
    });
    // test 4
    test("extends PureComponent", () => {
      const code = `
	class Car extends PureComponent {
	  constructor() {
	  super();
	  this.state = { color: "red" };
	  }
	  render() {
	  return <h2>I am a {this.state.color} Car!</h2>;
	  }
	}
	`;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      expect(verifiedComponents[0].verified).toContain("class extends react");
      expect(verifiedComponents[0].declaration_type).toEqual(
        "ClassDeclaration",
      );
    });
    // test 5
    test("export default class extends PureComponent", () => {
      const code = `
	export default class Car extends PureComponent {
	  constructor() {
	  super();
	  this.state = { color: "red" };
	  }
	  render() {
	  return <h2>I am a {this.state.color} Car!</h2>;
	  }
	}
	`;

      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      expect(verifiedComponents[0].verified).toContain("class extends react");
      expect(verifiedComponents[0].declaration_type).toEqual(
        "ClassDeclaration",
      );
    });
  });
  // indicator 4
  describe("containsHook", () => {
    // constants
    test("arrow function, with block statement", () => {
      const code = `const Component = () => { 
	        const [count, setCount] = useState(0);
		return <div></div> 
	}`;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      expect(verifiedComponents[0].verified).toContain("contains a hook");
    });
    // functions
    test("function with block statement", () => {
      const code = `function Component() { 
	        const [count, setCount] = React.useState(0);
		return <div></div> 
	}`;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      expect(verifiedComponents[0].verified).toContain("contains a hook");
    });
    // exports
    describe("exports", () => {
      test("export default arrow function with blockStatement", () => {
        const code = `export default () => {
	        const [count, setCount] = React.useState(0);
		return <JSX /> 
	}`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        expect(verifiedComponents[0].verified).toContain("contains a hook");
      });
      test("export default function", () => {
        const code = `export default function(){
	        const [count, setCount] = useState(0);
		return <div></div> 
	}`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        expect(verifiedComponents[0].verified).toContain("contains a hook");
      });
    });
  });
});
describe("export_types", () => {
  test("named constant", () => {
    const code = `export const ComponentName = () => <JSX />`;
    const topLevelDeclarations = parseFile(code);
    const verifiedComponents = verifyReactComponents(topLevelDeclarations);
    expect(verifiedComponents[0].export_type).toBe("named");
  });
  test("named function", () => {
    const code = `export function ComponentName(){ return <JSX /> }`;
    const topLevelDeclarations = parseFile(code);
    const verifiedComponents = verifyReactComponents(topLevelDeclarations);
    expect(verifiedComponents[0].export_type).toBe("named");
  });
});
