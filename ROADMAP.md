# Roadmap of react-diagram-schema

This file outlines the development goals for building the `react-diagram-schema` tool.

---

## Phase 1: MVP – React to Schema

🏁 Goal: extract meaningful metadata from React components and output it as structured JSON.

Output Schema Format:

```js
{
  "filename": "",
  "components": [
    {
      "name": "",
      "description": "",
      "descendants": [],
      "internal": { "states": [], "functions": [] },
      "external": { "props": [], "context": [], "constants": [] },
      "location": {}
    }
  ]
}
```

### To-Do List:

- [x] Parse React code using `@babel/parser`
- [x] Traverse AST with `@babel/traverse`
- [x] Extract component name and top-level logic
- [x] Extract internal states and functions
- [x] Extract external props, children, context
- [x] Output file-level schema with all component metadata
- [x] Extract descendants (will be used to infer component hierarchy in [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer))

#### 🗒 Note on Constants

The `constants` array will be skipped in the MVP.  
Support for per-file constant extraction (whether declared or imported) will be added **post-MVP**, after multi-file parsing is introduced.  
This will allow the schema to track constants at the **file level**, independent of any specific component.

#### 🗒 Note on Component Description

The description field (e.g., developer-authored comments like "Renders Form UI") will be skipped in the MVP.
Support for extracting this metadata will be added post-MVP, once parsing of inline comments is introduced.
This will allow the schema to capture each component's intended purpose in human-readable form, improving clarity and usefulness in diagrams.

---

## Phase 2: multi-file parsing support

🏁 Goal: accept a directory as input and output the entire application in schema form

Output Schema Format:

```js
{
    "ComponentName::filepath": {
      "name": "",
      "description": "",
      "descendants": [],
      "internal": { "states": [], "functions": [] },
      "external": { "props": [], "context": [], "constants": [] },
      "location": { line, filepath }
    }
}
```

### To-Do List

- [x] Refactor parsing logic into a new file called `parseCode.js`
- [x] Use DFS approach to traverse files and generate a schema of the entire application, starting from root file
- [x] Log a warning for each unresolved descendant
- [ ] Add support for constants
- [ ] Add support for inline comments that populate the description field

---

## Phase 3: Maintainability

🏁 Goal: on going maintenance support

### To-Do List

- [ ] Refactor `build-schema.js` logic and add inline comments to improve code readability and maintainability
- implement requested features
- resolve issues

---

## Potential Future Features

These are ideas we're considering or exploring. If you'd like to help shape them — through feedback or contribution — feel free to open an issue or PR.

1. **Visualizing enums or union types for props and state:**  
   Detect types like `variant: 'notice' | 'error' | 'success'` and display them visually or in a collapsible section.

2. **Basic schema validation:**  
   Validate that generated schemas meet the spec (e.g. missing keys, empty arrays).

3. **Support for TypeScript-only features:**  
   Deeper TypeScript support could enable more accurate parsing of generics, inferred types, and advanced annotations.
