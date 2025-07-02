#!/usr/bin/env node

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

//import * as t from "@babel/types";

const schema = {
  name: "",
  internal: {
    states: [],
    functions: [],
  },
};

const code = `function MyComponent() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}`;

const ast = parser.parse(code, {
  plugins: ["jsx", "typescript"],
  sourceType: "module",
});

traverse(ast, {
  FunctionDeclaration(path) {
    schema.name = path.node.id.name;
    schema.internal.functions.push(path.node.id.name + "()"); // Placeholder
  },
});

/*
traverse(ast, {
  FunctionDeclaration(path) {
    console.log('Function:', path.node.id.name);
  }
});
*/
