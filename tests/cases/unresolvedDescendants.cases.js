// cases/unresolvedDescendants.cases.js

const functionCases = [
  {
    name: "Extract descendant",
    code: `function Component(){ 
            return <Button></Button>
           }`,
    expected: {
      components: ["Component"],
      unresolvedDescendants: { Component: ["Button"] },
    },
  },
  {
    name: "Extract self-closing descendant",
    code: `function Component(){ 
            return <App />
           }`,
    expected: {
      components: ["Component"],
      unresolvedDescendants: { Component: ["App"] },
    },
  },
  {
    name: "Extract nested descendant",
    code: `function Component(){ 
            return <Layout><Main></Main></Layout>
           }`,
    expected: {
      components: ["Component"],
      unresolvedDescendants: { Component: ["Layout", "Main"] },
    },
  },
  {
    name: "Extract self-closing nested descendant",
    code: `function Component(){ 
            return <Layout><Main/></Layout>
           }`,
    expected: {
      components: ["Component"],
      unresolvedDescendants: { Component: ["Layout", "Main"] },
    },
  },
  {
    name: "Extract descendant nested in a conditional JS Expression",
    code: `function Component(){ 
            return <>{ condition && <HomePage /> }</> 
           }`,
    expected: {
      components: ["Component"],
      unresolvedDescendants: { Component: ["HomePage"] },
    },
  },
];

const exportCases = [
  {
    name: "Extract descendant",
    code: `export function Component(){ 
            return <Button></Button>
           }`,
    expected: {
      components: ["Component"],
      unresolvedDescendants: { Component: ["Button"] },
    },
  },
  {
    name: "Extract self-closing descendant",
    code: `export function Component(){ 
            return <App />
           }`,
    expected: {
      components: ["Component"],
      unresolvedDescendants: { Component: ["App"] },
    },
  },
  {
    name: "Extract nested descendant",
    code: `export function Component(){ 
            return <Layout><Main></Main></Layout>
           }`,
    expected: {
      components: ["Component"],
      unresolvedDescendants: { Component: ["Layout", "Main"] },
    },
  },
  {
    name: "Extract self-closing nested descendant",
    code: `export function Component(){ 
            return <Layout><Main/></Layout>
           }`,
    expected: {
      components: ["Component"],
      unresolvedDescendants: { Component: ["Layout", "Main"] },
    },
  },
  {
    name: "Extract descendant nested in a conditional JS Expression",
    code: `export function Component(){ 
            return <>{ condition && <HomePage /> }</> 
           }`,
    expected: {
      components: ["Component"],
      unresolvedDescendants: { Component: ["HomePage"] },
    },
  },
];

const defaultExportCases = [
  {
    name: "Extract descendant",
    code: `export default ()=> <Button></Button>`,
    expected: {
      components: [""],
      unresolvedDescendants: { "": ["Button"] },
    },
  },
  {
    name: "Extract self-closing descendant",
    code: `export default () => <App />`,
    expected: {
      components: [""],
      unresolvedDescendants: { "": ["App"] },
    },
  },
  {
    name: "Extract nested descendant",
    code: `export default () => <Layout><Main></Main></Layout>`,
    expected: {
      components: [""],
      unresolvedDescendants: { "": ["Layout", "Main"] },
    },
  },
  {
    name: "Extract self-closing nested descendant",
    code: `export default () => <Layout><Main/></Layout>`,
    expected: {
      components: [""],
      unresolvedDescendants: { "": ["Layout", "Main"] },
    },
  },
  {
    name: "Extract descendant nested in a conditional JS Expression",
    code: `export default () => <>{ condition && <HomePage /> }</>`,
    expected: {
      components: [""],
      unresolvedDescendants: { "": ["HomePage"] },
    },
  },
];

module.exports = { functionCases, exportCases, defaultExportCases };
