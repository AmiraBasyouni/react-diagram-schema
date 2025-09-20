# react-diagram-schema

`react-diagram-schema` is a CLI tool that transforms React source code into a JSON schema. The schema can be handed to [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) (a [ReactFlow](https://reactflow.dev/) based tool that renders the schema as an interactive UML-style diagram)

## Table of Contents

- [Limitations](#limitations)
- [Installation](#installation)
- [Usage](#usage)
- [Example Usage](#example-usage)
- [Flags](#flags)
- [Troubleshooting](#troubleshooting)
- [About JSON Schema](#about-json-schema)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Limitations

This CLI tool currently parses JavaScript (`.js` / `.jsx`) and TypeScript (`.ts` / `.tsx`) files but does not extract additional information from TypeScript files.

Extracting types from `.ts` / `.tsx` files is a planned feature that could be introduced in the future. To learn more regarding next steps and future plans, check out the [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) document.

**Major Dependencies**

- [@babel/parser](https://www.npmjs.com/package/@babel/parser) - Parses JavaScript code into an AST
- [@babel/traverse](https://www.npmjs.com/package/@babel/traverse) - Walks the AST and extracts component data
- [typescript](https://www.npmjs.com/package/typescript) - Compiles TypeScript/TSX files into JavaScript/JSX

## Installation

**To Install Locally:**

```bash
git clone https://github.com/AmiraBasyouni/react-diagram-schema
```

```bash
cd react-diagram-schema
```

```bash
npm install
```

**To Install Globally:**

```bash
npm install -g react-diagram-schema
```

## Arguments

The CLI tool accepts two positional arguments:

1. **(required)** `<entryDirectory>` or `<entryFile>`  
   Path to your application's entry directory or entry file.  
   Example: `./src/` or `./src/index.js`

2. _(optional)_ `[rootComponentName]`  
   Name of the root React component defined in the entry file.  
   If omitted, the tool falls back to the default export,  
   either from the entry file (if `<entryFile>` was provided)  
   or an index file (`index.tsx`, `index.ts`, `index.jsx`, or `index.js`)
   in the entry directory.  
   Example: `App`

## Usage

**If Not Installed,**

run on your React source code directly with `npx`:

```bash
npx react-diagram-schema <entryDirectory|entryFile> [rootComponentName]
```

Example:

```bash
npx react-diagram-schema ./src/components/App/ App
```

---

**If Installed Locally,**

1. Navigate to `react-diagram-schema`'s root directory:

   ```bash
   cd react-diagram-schema
   ```

2. Create a symbolic link:

   ```bash
   npm link
   ```

3. Navigate to your React project's directory and generate your schema.

   Example:

   ```bash
   cd ../xyflow/examples/react/src/App/
   ```

   ```bash
   build-schema ./
   ```

---

**If Installed Globally,**

run from any directory:

```bash
build-schema <entryDirectory|entryFile> [rootComponentName]
```

Example:

```bash
build-schema ./Header.jsx Header
```

---

## Example Usage

**Setup**  
Imagine `react-diagram-schema` is installed locally, and the current working directory is the repository root.

**Command**  
`./src/build-schema ./sample-components/ App`

**Result**  
The command generates a `schema.json` file with the following structure:

```json
{
  "App::sample-components/App.js": {
    "name": "App",
    "description": "",
    "descendants": [
      "Header::sample-components/Header.js",
      "Content::sample-components/App.js"
    ],
    "internal": {
      "states": [
        ["count", "setCount"],
        ["theme", "setTheme"]
      ],
      "functions": ["buttonHandler", "B"]
    },
    "external": {
      "props": ["children", "propA", "propB", "propC"],
      "context": [
        {
          "source": "FavouriteColorContext",
          "values": ["favouriteColor"]
        },
        {
          "source": "FavouriteThemeContext",
          "values": ["theme1", "theme2"]
        }
      ],
      "constants": []
    },
    "defaultExport": false,
    "location": {
      "line": 7,
      "filepath": "sample-components/App.js"
    }
  },
  "Content::sample-components/App.js": {
    "name": "Content",
    "description": "",
    "descendants": [],
    "internal": {
      "states": [],
      "functions": []
    },
    "external": {
      "props": [],
      "context": [],
      "constants": []
    },
    "defaultExport": false,
    "location": {
      "line": 43,
      "filepath": "sample-components/App.js"
    }
  },
  "B::sample-components/App.js": {
    "name": "B",
    "description": "",
    "descendants": [],
    "internal": {
      "states": [],
      "functions": ["C"]
    },
    "external": {
      "props": ["color"],
      "context": [],
      "constants": []
    },
    "defaultExport": false,
    "location": {
      "line": 17,
      "filepath": "sample-components/App.js"
    },
    "nested": true
  },
  "Header::sample-components/Header.js": {
    "name": "Header",
    "description": "",
    "descendants": [],
    "internal": {
      "states": [],
      "functions": []
    },
    "external": {
      "props": [],
      "context": [],
      "constants": []
    },
    "defaultExport": false,
    "location": {
      "line": 3,
      "filepath": "sample-components/Header.js"
    }
  }
}
```

This schema can be rendered as an interactive diagram using [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer):

![ReactFlow Diagram](assets/readme-md-diagram-preview.png)

The generated schema can also be passed to custom tools for further analysis.

## Flags

**Quiet**  
Purpose: suppresses error and warning console messages, showing only success messages. Critical errors will still be printed if the program fails to run.
Usage: append `--quiet` to the end of your command like so:

```bash
build-schema ./components/App App --quiet
```

**Verbose**  
Purpose: prints all error and warning console messages.  
Usage: append `--verbose` to the end of your command like so:

```bash
build-schema ./components/App App --verbose
```

**Debug**  
Purpose: prints error and warning console messages, and also outputs the generated JSON schema to the console for quick inspection.  
Usage: append `--debug` to the end of your command like so:

```bash
build-schema ./components/App App --debug
```

## Troubleshooting

:heavy_exclamation_mark: **Empty Schema**

**Message**

```
✅ Success: Parsed 0 components from 0 files in 0.252575 milliseconds
```

Tips:

- If the entry file does not contain a default export, ensure the `[rootComponentName]` field is provided.

---

:x: **Error**  
invalid path

**Message**

```
Error: (build-schema) invalid path "undefined", please provide a valid directory or file path as your first argument (e.g. "./src")
```

This error may occur in the following cases:

1. The first argument to the `build-schema` executable was omitted.
2. An invalid first argument was provided (for example, the file path or directory does not exist).

_Hint:_  
_Ensure the current directory and first argument are valid before running `build-schema` (example argument: `./components`)_

---

:x: **Error**  
invalid component name

**Message**

```
Error: (build-schema) invalid component name "app", please provide a valid component name as your second argument (e.g. "App")
```

This error may occur in the following cases:

1.  An invalid second argument was provided (e.g. the component name did not start with a capital letter).

_Hint:_  
_Ensure the second argument matches the name of the component defined in the entry file (e.g. `ComponentName` defined in `ComponentName.js` or in `index.js`)_

---

:warning: **Warning**  
descendant could not be resolved

**Message**

```
WARNING: (build-schema) the descendant <descendant-name> of component <component-name> could not be resolved within the file <file-path>
```

This warning may occur in the following cases:

1. The file indicated in `<file-path>` does not exist or could not be found by the parser.
2. The descendant was imported from `node_modules` (if this is the case, then you can safely ignore this warning).

_Hint:_  
_Look for the file indicated in `<file-path>`_

## About JSON Schema

- Stores **general** data such as:
  - a component's name
  - description about the component's purpose (which will be integrated using inline comments)
  - a component's descendants (the component's direct children)
  - a component's location (more specifically, the file path and declaration line)

---

- Stores **internally defined** data such as:
  - states and state setters
  - function declarations

---

- Stores **externally defined** data such as:
  - props
  - context dependencies
  - constants (which will be integrated in future releases)

---

- Describes your app’s structure
- Can power other tools or workflows; feel free to reuse it however you like
- Integrates seamlessly with [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) (a [ReactFlow](https://reactflow.dev/) based tool that renders the schema as an interactive UML-style diagram)

## Roadmap

Please visit [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) to view the project's progress, and planned features.

## Contributing

Please visit [CONTRIBUTING.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/CONTRIBUTING.md) to learn about how you can contribute to `react-diagram-schema`.

## License

[MIT](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/LICENSE.md)
