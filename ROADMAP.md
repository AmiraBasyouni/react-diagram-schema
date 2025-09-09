# Roadmap of react-diagram-schema

This file outlines the development goals for building the `react-diagram-schema` tool.

## Phase 1: Minimum Viable Product

### Stage 1

:checkered_flag: Goal: Single File Parsing

- Extract meaningful metadata from a single React source code file.
- Output the metadata as a structured JSON.

:pencil2: Schema Design:

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

:rocket: Core Features:

- [x] Turn a string of React code into an AST

- Traverse AST to extract:
  - [x] `name`
  - [x] `filename` and `location`
  - [x] internal `states`
  - [x] internal `functions`
  - [x] external `props` (including children)
  - [x] external `context`
  - [x] `descendants` (will be used to infer ReactFlow’s elkjs layouts for hierarchical diagrams in [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer))

- Enable user input and schema output
  - [x] output schema to the console
  - [x] output JSON schema to a schema.json file
  - [x] migrate from inline testing to accepting as user input a React source code file

Note:  
The extraction of `constants` and `description` were deferred, they will be extracted post-MVP.

:hourglass: **Timeline:** Stage 1 completed on July 6, 2025

---

### Stage 2

:checkered_flag: Goal: Multi-file Parsing

- Parse entire directories to generate comprehensive schemas for complex applications

:pencil2: New Schema Design:

```js
"ComponentName::filepath": {
    "name": "",
    "description": "",
    "descendants": [],
    "internal": { "states": [], "functions": [] },
    "external": { "props": [], "context": [], "constants": [] },
    "location": { line, filepath }
}
```

:memo: Notes:

- Added a unique identifier for each component.
- Simplified `location` to hold `line` and `filepath` instead of a `loc` object.
- Moved component objects up one level to simplify schema structure.
- Removed `filename` because it is included in each component's unique ID.

:rocket: Core Features:

- [x] Update expected user input, from accepting a single source file to accepting a directory + component name
- Integrate File Traversal Logic:
  - [x] Add DFS traversal logic to resolve component dependencies across files
  - [x] Extract import paths for unresolved descendants

- Improve Debugging:
  - [x] Validate parsing logic with a unit test
  - [x] Log a warning for each unresolved descendant

:sparkles: Added Features:

- Flags  
  integrated `--silent` and `--verbose` to hide detailed Notes/Warnings from console. Makes the product more user friendly. Retains the ability to turn on detailed outputs for debugging and development.

- Prompt Before Overwrite  
  when a `schema.json` file exists in the current directory, prompt the user before overwriting that file.

:hourglass: **Timeline:** Stage 2 completed on July 19, 2025

---

### Stage 2.5

:checkered_flag: Goal: Cover Edge Cases

- Improve ability to resolve exported components
- Cover common edge cases

:pencil2: Modified Schema Design:

```js
"ComponentName::filepath": {
    "name": "",
    "description": "",
    "descendants": [],
    "internal": { "states": [], "functions": [] },
    "external": { "props": [], "context": [], "constants": [] },
    "defaultExport": false,
    "location": { line, filepath }
}
```

:memo: Note:

- Added `defaultExport` to name default exported components by their imported name.

  _example:  
  `import Base from './path'` assigns unique ID `Base::path/filename.jsx` while the actual component name remains `App` (the default export)._
  - [x] Resolve exports using [Nodejs](https://nodejs.org/en)
  - [x] Resolve alias file paths (e.g. `@xyflow`)
  - [x] Modify component IDs to use `displayName` alias instead of the component name
  - [x] Support extracting `forwardRef` wrapped components
  - [x] Name default exported components by their imported name
  - [x] Handle imported Provider components

:sparkles: Added Features:

- Flags  
  improved CLI logging with verbosity levels: quiet, verbose, and debug.

- User Input  
  extended user input functionality to accept an entry directory OR an entry file.

- Expand prop extraction  
  extended props to include identifiers (e.g. ref)

:hourglass: **Timeline:** Stage 2.5 completed on August 22, 2025

---

### Stage 3

:checkered_flag: Goal: Testing

- set up test suites:
  - component detection and schema structure,
  - data extraction,
  - and edge cases in React Components.

:mag: Tests:

- [x] Validate parsing of function-defined React components
- [x] Validate parsing of inline arrow function components
- [x] Validate parsing of multiple components (function + inline) in a single file
- [x] Validate extraction of metadata:
  - [x] React states
  - [x] functions
  - [x] props
  - [x] context-props
  - [ ] ~~constants~~ (skipped until post-MVP)
- [x] Validate parsing edge cases:
  - [x] no React states
  - [x] no functions
  - [x] no props
  - [x] no context-props
  - [x] no constants
- [x] Validate parsing nested components
  - [x] nested inline components
  - [x] nested function-defined components
- [x] Validate parsing exported components
  - [x] parse default export function components
  - [x] parse named export function components
  - [x] parse named export inline components
  - [x] parse anonymous default export function components
  - [x] parse anonymous default inline components

:sparkles: Added Features:

- TypeScript Support  
  `.ts` and `.tsx` files are now compiled and parsed. Extracting types is planned post-MVP.

- Arguments  
  the `rootComponentName` is now an optional argument. With this feature, `react-diagram-schema` has become easier to use, without limiting its ability to specify a component to be parsed.

:hourglass: **Timeline:** Stage 3 completed on August 8, 2025

## Phase 2: Early Validation

:checkered_flag: Goal: Get the product in front of real users to see if users are able to utilize and benefit from it

:satellite: Target Audience:

- solo React developers
- React developer teams
- developers that need to maintain a large React code base

:mailbox_with_mail: User Feedback:

- [ ] get the product in front of 3-5 real users.
- [ ] observe if users are able to utilize the product with only the README instructions
- [ ] check if the product successfully alleviated a pain point
- [ ] continue developing the MVP to fix any accessibility/usability issues

:hourglass_flowing_sand: **Timeline:** Phase 2 scheduled for September 15, 2025

## Phase 3: Product-Market Fit

:checkered_flag: Goal: Identify and prioritize the most requested features based on real user feedback to better align the tool with developer workflows.

:mailbox_with_mail: User Feedback:

- [ ] propose features (e.g. TypeScript support) via GitHub Issues to assess public demand
- [ ] keep a tally to figure out what the most requested feature is

:zap: Performance and Stability:

- [ ] implement the most requested feature
- [ ] Optimize parsing for 50+ components with <5s runtime and <500MB memory usage (through caching and limited file re-parsing)

:telescope: Features To Consider:

1. Visualizing enums or union types for props and state:
   - [ ] Detect types like `variant: 'notice' | 'error' | 'success'` and display them visually or in a collapsible section.

---

2. Add basic schema validation:
   - [ ] Validate that generated schemas meet the spec (e.g. spot missing keys, empty arrays) using unit tests

---

3. Support TypeScript files:
   - [x] Parse `.ts` and `.tsx` files
   - [ ] Parse types to enable accurate parsing of generics, inferred types, and advanced annotations.

---

4. Adding a flag (e.g., `--group-by-filepath`) to `react-diagram-schema` to group components by directory for modular analysis and visualization:
   - [ ] Add a `--group-by-filepath` flag to `react-diagram-schema` to output a schema with components nested under filepath keys (e.g., `{ "src/components": { "App::App.js": {...}, "Header::Header.js": {...} } }`).

---

5. Add schema metadata (e.g., `isCollapsible`, `descendantDepth`) to support collapsible nodes in [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer):
   - [ ] Add structural hints (e.g., depth of descendants, group membership) to support collapsible visualizations without altering its static nature. For a component with many descendants (e.g., App with 20+ children), metadata like `"descendantDepth": 3` allows the visualizer to collapse subtrees, reducing visual clutter in enterprise-scale diagrams.
   - [ ] Add schema metadata (e.g., "isCollapsible": true for components with >5 descendants) to support visualizer rendering of collapsible nodes.

---

:hourglass_flowing_sand: **Timeline:** Phase 3 scheduled for October 1, 2025

## Phase 4: Scale

:checkered_flag: Goal: Get `react-diagram-schema` to serve as a foundation for development tools

:chart_with_upwards_trend: Scale:

- [ ] add a demo video to ease onboarding
- [ ] implement a linter that relies on schema (to enforce architectural rules e.g. "No components should have more than 5 children", "Don’t allow cycles in the component hierarchy", "Component names must be PascalCase"))
- [ ] VS Code integration (e.g. make a linter for schema files, show diagrams based on schema content, link to relevant component files based on schema paths)
- [ ] analyze structure as part of CI pipelines. (e.g. Block PRs that add circular component references, Require new components to appear in the schema, Warn if a component exceeds a certain depth in the tree.)

:hourglass_flowing_sand: **Timeline:** Phase 4 scheduled for November 1, 2025

## Future Direction

Schema will continue to evolve based on needs of downstream tools

- [AmiraBasyouni/react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) enhancements
- IDE integrations
- Linting/code auditing use cases

These are ideas we're considering or exploring.  
If you'd like to help shape them through feedback or contribution, feel free to open an issue or PR.
