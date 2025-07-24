# Roadmap of react-diagram-schema

This file outlines the development goals for building the `react-diagram-schema` tool.

---

## Phase 1: Minimum Viable Product

### Stage 1

**🏁 Goal**:  
extract meaningful metadata from a single React source code file and output the metadata as a structured JSON.

Schema Design:

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

**🔌 Developer Check List:**

- [x] Turn a string of React code into an AST

- Traverse AST to extract:
  - [x] `name`
  - [x] `filename` and `location`
  - [x] internal `states` 
  - [x] internal `functions`
  - [x] external `props` (including children)
  - [x] external `context`
  - [x] `descendants` (will be used to infer ReactFlow’s elkjs layouts for hierarchical diagrams in [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer))  

- Enable user input and schema output:
  - [x] output schema to the console
  - [x] output JSON schema to a schema.json file
  - [x] migrate from inline testing to accepting as user input a React source code file

🗒 Note:  
The extraction of `constants` and `description` were deferred. They will be extracted after the MVP stage, when multi-file parsing is introduced

⌛ Stage 1 **complete** - July 6th, 2025

---

### Stage 2

**🏁 Goal**  
parse entire directories to generate comprehensive schemas for complex applications

New Schema Design:

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

🗒 Note:  
Schema’s `descendants` and metadata (e.g., `isCollapsible`, filepath grouping) support `elkjs`-based ReactFlow layouts for scalable, interactive diagrams.

**🔌 Developer Check List:**

- [x] to reduce code complexity, refactor the parsing and traversal logic into its own file

- [x] update expected user input, from accepting a single source file to accepting a directory + component name

Integrate File Traversal Logic:
- [x] Add DFS traversal logic to resolve component dependencies across files
- [x] Extract import paths for unresolved descendants

Improve Debugging:
- [x] Validate parsing logic with unit tests
- [x] Log a warning for each unresolved descendant

**✨ Additional Features Added:**

- _Flags_ - integrated `--silent` and `--verbose` in order to hide detailed Notes/Warnings from the console. This should make the product more user friendly while retaining the ability to turn on detailed outputs for debugging and development purposes.
- _Prompt Before Overwrite_ - when a schema.json file exists in the current directory, prompts user before overwriting the file

⌛ Stage 2 **complete** - July 19th, 2025

---

## Phase 2: Early Validation

🏁 Goal:
get the product infront of real users to see if users are able to utilize and benefit from it

Target Audience:

- solo React developers
- React developer teams
- developers that need to maintain a large React code base

**🔍 Developer Check List:**

- [ ] get the product in front of 3-5 real users.
- [ ] observe if users are able to utilize the product with only the README instructions
- [ ] check if the product successfuly alleviated a pain point
- [ ] continue developing the MVP to fix any accessibility/usability issues

⏳ Phase 2 **in progress** - July 31, 2025

---

## Phase 3: Product-Market Fit

🏁 Goal:
Identify and prioritize the most requested features based on real user feedback to better align the tool with developer workflows.

**🔍 Developer Check List:**

- [ ] propose features (e.g. TypeScript support) via GitHub Issues to assess public demand
- [ ] keep a tally to figure out what the most requested feature is

**⚡ Developer Check List:**

- [ ] implement the most requested feature
- [ ] Optimize parsing for 50+ components with <5s runtime and <500MB memory usage (through caching and limited file re-parsing)

**✨ Features To Consider:**

- Visualizing enums or union types for props and state:  
Detect types like `variant: 'notice' | 'error' | 'success'` and display them visually or in a collapsible section.

- Add Basic schema validation:  
Validate that generated schemas meet the spec (e.g. missing keys, empty arrays) using unit tests

- Support TypeScript files:  
Deeper TypeScript support could enable more accurate parsing of generics, inferred types, and advanced annotations.

- adding a flag (e.g., `--group-by-filepath`) to `react-diagram-schema` to group components by directory (filepath) for modular analysis and visualization:  
Add a `--group-by-filepath` flag to `react-diagram-schema` to output a schema with components nested under filepath keys (e.g., { "src/components": { "App::App.js": {...}, "Header::Header.js": {...} } }).

- Add schema metadata (e.g., `isCollapsible`, `descendantDepth`) to support collapsible nodes in [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer):  
  - The schema can store structural hints (e.g., depth of descendants, group membership) to support collapsible visualizations without altering its static nature.  
  - For a component with many descendants (e.g., App with 20+ children), metadata like `"descendantDepth": 3` allows the visualizer to collapse subtrees, reducing visual clutter in enterprise-scale diagrams.
  - Add schema metadata (e.g., "isCollapsible": true for components with >5 descendants) to support visualizer rendering of collapsible nodes.

⏳ Phase 3 **scheduled** - Auguest 8th, 2025

---

## Phase 4: Scale

🏁 Goal:
get `react-diagram-schema` to serve as a foundation for development tools

- [ ] add a demo video to ease onboarding
- [ ] implement a linter that relies on schema (to enforces architectural rules e.g. "No components should have more than 5 children", "Don’t allow cycles in the component hierarchy", "Component names must be PascalCase"))
- [ ] VS Code integration (e.g. make a linter for schema files, show diagrams based on schema content, link to relevant component files based on schema paths)
- [ ] analyze structure as part of CI pipelines. (e.g. Block PRs that add circular component references, Require new components to appear in the schema, Warn if a component exceeds a certain depth in the tree.)

⏳ Phase 4 **scheduled** - September 2nd, 2025

---

## Future Direction

Schema will continue to evolve based on needs of downstream tools

- [AmiraBasyouni/react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) enhancements
- IDE integrations
- Linting/code auditing use cases

These are ideas we're considering or exploring. If you'd like to help shape them — through feedback or contribution — feel free to open an issue or PR.

