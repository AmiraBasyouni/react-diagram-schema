// props, state, context
const parseCode = require("../src/parseCode");

describe("Data Extraction", () => {
  test("extracts props from a component", () => {
    const fakePath = "../fake/PropsComponent.js";
    const code = `
      function PropsComponent({ title, count }) {
        return <h1>{title} {count}</h1>;
      }
    `;

    const result = parseCode(code, fakePath);
    const component = result[`PropsComponent::${fakePath}`];

    expect(component.external.props).toEqual(
      expect.arrayContaining(["title", "count"]),
    );
  });

  test("extracts state variables from a component", () => {
    const fakePath = "../fake/StateComponent.js";
    const code = `
      function StateComponent() {
        const [count, setCount] = React.useState(0);
        const [theme, setTheme] = useState('light');
        return <div>{count} {theme}</div>;
      }
    `;

    const result = parseCode(code, fakePath);
    const component = result[`StateComponent::${fakePath}`];

    expect(component.internal.states).toEqual(
      expect.arrayContaining([
        ["count", "setCount"],
        ["theme", "setTheme"],
      ]),
    );
  });

  test("extracts context usage from a component", () => {
    const fakePath = "../fake/ContextComponent.js";
    const code = `
      function ContextComponent() {
        const color = useContext(FavouriteColorContext);
        const { theme } = React.useContext(FavouriteThemeContext);
        return <div>{color} {theme}</div>;
      }
    `;

    const result = parseCode(code, fakePath);
    const component = result[`ContextComponent::${fakePath}`];

    expect(component.external.context).toEqual(
      expect.arrayContaining([
        { source: "FavouriteColorContext", values: ["color"] },
        { source: "FavouriteThemeContext", values: ["theme"] },
      ]),
    );
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
