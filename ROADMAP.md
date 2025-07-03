# Roadmap: react-diagram-schema

This file outlines the phases and tasks for building the `react-diagram-schema` tool.

---

## Phase 1: MVP – React to Schema

Extract meaningful metadata from React components and output it as structured JSON.

### Goals:
- [x] Parse React code using `@babel/parser`
- [x] Traverse AST with `@babel/traverse`
- [x] Identify component name and logic
- [x] Extract internal state and functions
- [ ] Extract external props, children, hooks
- [ ] Output JSON schema for each component

---

## Phase 2: Schema to Visual Diagram (via `react-diagram-visualizer`)

Use the schema output to generate a diagram using [React Flow](https://reactflow.dev/).

> This will live in a separate repo: `react-diagram-visualizer`.

---

## Potential Future Features

These are ideas we're considering or exploring. If you'd like to help shape them — through feedback or contribution — feel free to open an issue or PR.

1. **Visualizing enums or union types for props and state**  
   Detect types like `variant: 'notice' | 'error' | 'success'` and display them visually or in a collapsible section.

2. **CLI improvements: processing multiple component files at once**  
   Currently supports one file at a time. In the future, we might add support for batch input or glob patterns.

3. **Basic schema validation**  
   Validate that generated schemas meet the spec (e.g. missing keys, empty arrays).

4. **Support for TypeScript-only features**  
   Deeper TypeScript support could enable more accurate parsing of generics, inferred types, and advanced annotations.

