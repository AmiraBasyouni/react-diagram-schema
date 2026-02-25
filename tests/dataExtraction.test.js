// dataExtraction.test.js
// Goal: Ensure props, states, context, and functions are accurately extracted from components.
// Cases Covered: props, state, context
//const parseCode = require("../src/parseCode");
const parseFile = require("../src/parseFile");
const verifyReactComponents = require("../src/verifyReactComponents");
const parseReactComponents = require("../src/parseReactComponents");

describe("Extract Data", () => {
  // STATE
  describe("Extract state from", () => {
    test("constants ArrowFunction", () => {
      const fakePath = "../fake/StateComponent.js";
      const code = `
      const StateComponent = () => {
        const [count, setCount] = React.useState(0);
        const [theme, setTheme] = useState('light');
        return <div>{count} {theme}</div>;
      }
    `;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`StateComponent::${fakePath}`];
      expect(component.internal.states).toEqual(
        expect.arrayContaining([
          ["count", "setCount"],
          ["theme", "setTheme"],
        ]),
      );
    });
    test("constants initialized with CallExpression", () => {
      const fakePath = "../fake/StateComponent.js";
      const code = `
      const StateComponent = forwardRef(() => {
        const [count, setCount] = React.useState(0);
        const [theme, setTheme] = useState('light');
        return <div>{count} {theme}</div>;
      })
    `;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`StateComponent::${fakePath}`];
      expect(component.internal.states).toEqual(
        expect.arrayContaining([
          ["count", "setCount"],
          ["theme", "setTheme"],
        ]),
      );
    });

    test("functions", () => {
      const fakePath = "../fake/StateComponent.js";
      const code = `
      function StateComponent() {
        const [count, setCount] = React.useState(0);
        const [theme, setTheme] = useState('light');
        return <div>{count} {theme}</div>;
      }
    `;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`StateComponent::${fakePath}`];
      expect(component.internal.states).toEqual(
        expect.arrayContaining([
          ["count", "setCount"],
          ["theme", "setTheme"],
        ]),
      );
    });
    test.skip("classes", () => {
      const fakePath = "../fake/StateComponent.js";
      const code = `
      class StateComponent extends React.Component {
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
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`StateComponent::${fakePath}`];
      expect(component.internal.states).toEqual(
        expect.arrayContaining([["color"]]),
      );
    });
    test("export default", () => {
      const fakePath = "../fake/StateComponent.js";
      const code = `
      export default () => {
        const [count, setCount] = React.useState(0);
        const [theme, setTheme] = useState('light');
        return <div>{count} {theme}</div>;
      }
    `;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`::${fakePath}`];
      expect(component.internal.states).toEqual(
        expect.arrayContaining([
          ["count", "setCount"],
          ["theme", "setTheme"],
        ]),
      );
    });
    test("export named", () => {
      const fakePath = "../fake/StateComponent.js";
      const code = `
      export const StateComponent = () => {
        const [count, setCount] = React.useState(0);
        const [theme, setTheme] = useState('light');
        return <div>{count} {theme}</div>;
      }
    `;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`StateComponent::${fakePath}`];
      expect(component.internal.states).toEqual(
        expect.arrayContaining([
          ["count", "setCount"],
          ["theme", "setTheme"],
        ]),
      );
    });
  });
  // FUNCTIONS
  describe("Extract internal functions of type (defined and inline)", () => {
    test("defined and inline", () => {
      const fakePath = "../fake/FunctionExtraction.js";
      const code = `
    function FunctionExtraction() {
      function handleClick() {
        console.log("clicked");
      }

      const handleSubmit = () => {
        console.log("submitted");
      }

      return <div onClick={handleClick} />;
    }
  `;

      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const componentKey = `FunctionExtraction::${fakePath}`;
      const component = result[componentKey];
      const internalFunctions = component.internal.functions;

      expect(Object.keys(result)).toContain(componentKey);
      expect(internalFunctions).toContain("handleClick");
      expect(internalFunctions).toContain("handleSubmit");
    });
    test("nested component", () => {
      const fakePath = "../fake/Component.js";
      const code = `
      function Component() {
        function NestedComponent(){
	  return <div></div>
	}
        return <p></p>;
      }
    `;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`Component::${fakePath}`];
      expect(component.internal.functions).toContain("NestedComponent");
    });
  });
  // PROPS
  describe("Extract props from", () => {
    test("functions", () => {
      const fakePath = "../fake/PropsComponent.js";
      const code = `
      function PropsComponent({ title, count }) {
        return <h1>{title} {count}</h1>;
      }
    `;

      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`PropsComponent::${fakePath}`];
      expect(component.external.props).toEqual(
        expect.arrayContaining(["title", "count"]),
      );
    });
  });
  // CONTEXT
  describe("Extract context from", () => {
    test("functions", () => {
      const fakePath = "../fake/ContextComponent.js";
      const code = `
      function ContextComponent() {
        const color = useContext(FavouriteColorContext);
        const { theme } = React.useContext(FavouriteThemeContext);
        return <div>{color} {theme}</div>;
      }
    `;

      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`ContextComponent::${fakePath}`];

      expect(component.external.context).toEqual(
        expect.arrayContaining([
          { source: "FavouriteColorContext", values: ["color"] },
          { source: "FavouriteThemeContext", values: ["theme"] },
        ]),
      );
    });
  });
  // DESCENDANTS
  describe("Extract descendants from", () => {
    describe("self-closing tags in", () => {
      test("functions", () => {
        const fakePath = "../fake/DescendantsComponent.js";
        const code = `
      function DescendantsComponent() {
        return <HomePage/>;
      }
    `;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        const result = parseReactComponents(verifiedComponents, fakePath);
        const component = result[`DescendantsComponent::${fakePath}`];
        expect(component.unresolvedDescendants).toEqual(["HomePage"]);
      });
      test("constant ArrowFunctions, no blockStatement", () => {
        const fakePath = "../fake/DescendantsComponent.js";
        const code = `const DescendantsComponent = () => <HomePage/>;`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        const result = parseReactComponents(verifiedComponents, fakePath);
        const component = result[`DescendantsComponent::${fakePath}`];
        expect(component.unresolvedDescendants).toEqual(["HomePage"]);
      });
      test("constant ArrowFunctions, with blockStatement", () => {
        const fakePath = "../fake/DescendantsComponent.js";
        const code = `const DescendantsComponent = () => { return <HomePage/>; }`;
        const topLevelDeclarations = parseFile(code);
        const verifiedComponents = verifyReactComponents(topLevelDeclarations);
        const result = parseReactComponents(verifiedComponents, fakePath);
        const component = result[`DescendantsComponent::${fakePath}`];
        expect(component.unresolvedDescendants).toEqual(["HomePage"]);
      });
    });

    test("opening and closing tags", () => {
      const fakePath = "../fake/DescendantsComponent.js";
      const code = `
      function DescendantsComponent() {
        return <Header></Header>;
      }
    `;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`DescendantsComponent::${fakePath}`];
      expect(component.unresolvedDescendants).toEqual(["Header"]);
    });

    test("nestedDescendants", () => {
      const fakePath = "../fake/NestedDescendantsComponent.js";
      const code = `
      function NestedDescendantsComponent() {
        return <Routes><Route><Hello/></Route></Routes>;
      }
    `;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`NestedDescendantsComponent::${fakePath}`];
      expect(component.unresolvedDescendants).toEqual([
        "Routes",
        "Route",
        "Hello",
      ]);
    });
  });
  describe("Extract defaultExport from", () => {
    test("export default () =>", () => {
      const fakePath = "../fake/StateComponent.js";
      const code = `export default () => <JSX/>`;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`::${fakePath}`];
      expect(component.defaultExport).toEqual(true);
    });
    test("export default function", () => {
      const fakePath = "../fake/StateComponent.js";
      const code = `export default function StateComponent(){ return <JSX/> }`;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`StateComponent::${fakePath}`];
      expect(component.defaultExport).toEqual(true);
    });
    test("export named", () => {
      const fakePath = "../fake/StateComponent.js";
      const code = `export const StateComponent = () => <JSX/>`;
      const topLevelDeclarations = parseFile(code);
      const verifiedComponents = verifyReactComponents(topLevelDeclarations);
      const result = parseReactComponents(verifiedComponents, fakePath);
      const component = result[`StateComponent::${fakePath}`];
      expect(component.defaultExport).toEqual(false);
    });
  });

  test.skip("extracts imported constants used in a component", () => {
    const fakePath = "../fake/ConstantsComponent.js";
    const code = `
      import { API_URL, VERSION } from './config';
      function ConstantsComponent() {
        console.log(API_URL, VERSION);
        return <div>{VERSION}</div>;
      }
    `;

    const result = parseCode(code, fakePath);
    const component = result[`ConstantsComponent::${fakePath}`];

    expect(component.external.constants).toEqual(
      expect.arrayContaining(["API_URL", "VERSION"]),
    );
  });
});
