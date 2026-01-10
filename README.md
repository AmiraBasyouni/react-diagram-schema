# Intro

`react-diagram-schema` is a CLI tool that transforms React source code into a JSON schema. The schema can be handed to [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) (a [ReactFlow](https://reactflow.dev/) based tool that renders the schema as an interactive UML-style diagram)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Example Output](#example-output)
- [Arguments](#arguments)
- [Flags](#flags)
- [Troubleshooting](#troubleshooting)
- [About JSON Schema](#about-json-schema)
- [Dependencies](#dependencies)
- [Limitations](#limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

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

## Usage

**Without Installing,**

run on your React source code directly with `npx`:

```bash
npx react-diagram-schema <entryDirectory|entryFile> [rootComponentName]
```

Examples:

1. If the name of the component matches the name of the file,  
   supplying just the `<entryFile>` or the `<entryDirectory>` + `[rootComponentName]` is sufficient:

- For an App.jsx file, targeting a component App,

  ```bash
  npx react-diagram-schema ./src/components/App.jsx
  ```

  ```bash
  npx react-diagram-schema ./src/components/App/ App
  ```

2. index.(js/jsx/ts/tsx) files are checked automatically.  
   Thus, when targeting an index file, `<entryFile>` becomes optional:

- For an index.jsx file, targeting a component Scroll
  ```bash
  npx react-diagram-schema ./src/components/ Scroll
  ```
  ```bash
  npx react-diagram-schema ./src/components/index.jsx Scroll
  ```

3. If the name of the component does not match the name of the file,  
   you must explicitly supply both `<entryFile>` + `[rootComponentName]`:

- targeting a component Button
  ```bash
  npx react-diagram-schema ./src/components/App/App.jsx Button
  ```

4. If the target component is not supplied, the fallback is  
   either assuming that the component name matches the file name (i.e. the first example)  
   or assuming that the target component is default exported:

- targeting a default exported component
  ```bash
  npx react-diagram-schema ./src/components/index.jsx
  ```

---

**After Installing Locally,**

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
   react-diagram-schema ./
   ```

---

**After Installing Globally,**

run from any directory:

```bash
react-diagram-schema <entryDirectory|entryFile> [rootComponentName]
```

Example:

```bash
react-diagram-schema ./Header.jsx Header
```

## Example Output

**Setup**

- Locally installed `react-diagram-schema`
- The current working directory is `./react-diagram-schema/`.

**Command**

- Targeting the sample file App.js (_located in `./sample-components/`_) for component App:
  ```bash
  react-diagram-schema ./sample-components/ App
  ```

**Result**  
I get the following messages in the Console:

```
✅ Success: Parsed 4 components from 2 files in 50.585535 milliseconds
```

```
💾 Saved: Schema has been written to react-diagram-schema/schema.json
```

The `schema.json` file is written to your current working directory, and has the following structure:

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
    },
    "isEntryComponent": true
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

This schema can then be rendered as an interactive diagram using [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer):

![ReactFlow Diagram](assets/readme-md-diagram-preview.png)

Checkout [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) to learn more about visualizing the schema.

Another option is to pass the schema to your own custom built tools for further analysis.

## Arguments

The CLI tool accepts two positional arguments:

1. **(required)** `<entryDirectory>` or `<entryFile>`  
   This is a path to your application's entry directory or entry file.  
   Example: `./src/` or `./src/index.js`

2. _(optional)_ `[rootComponentName]`  
   This is the name of the React component defined in the entry file.  
   If omitted, the tool falls back to the default export,  
   either from the entry file (if `<entryFile>` was provided)  
   or an index file (`index.tsx`, `index.ts`, `index.jsx`, or `index.js`)
   in the entry directory.  
   Example: `App` or `Button`

## Flags

**Output File**
Purpose: specify the filename/path where the schema should be saved.  
Note: By default, a `schema.json` file will be saved in your current working directory
Usage: append `--out` or `--output` to the end of your command like so:

```bash
react-diagram-schema ./src App --out ./archive/my-schema.json
```

**Quiet**  
Purpose: suppresses success, error, and warning console messages. Critical errors will still be printed if the program fails to run. A request to overwrite a pre-existing json file will also be printed if relevant.  
Usage: append `--quiet` to the end of your command like so:

```bash
react-diagram-schema ./components/App App --quiet
```

**Verbose**  
Purpose: prints all error and warning console messages.  
Usage: append `--verbose` to the end of your command like so:

```bash
react-diagram-schema ./components/App App --verbose
```

**Debug**  
Purpose: prints error and warning console messages, and also prints the generated JSON schema to the console for quick inspection.  
Usage: append `--debug` to the end of your command like so:

```bash
react-diagram-schema ./components/App App --debug
```

## Troubleshooting

:heavy_exclamation_mark: **Empty Schema**

**Message**

```
✅ Success: Parsed 0 components from 0 files in 0.252575 milliseconds
```

This runtime error implies that the CLI tool could not find any components in the provided/fallback files.

Tips:

- Check whether the supplied `<entryFile>` contains at least one component declaration.
- If supplying an `<entryDirectory>`, check whether a `[rootComponentName]`.(js/jsx/ts/tsx) or index.(js/jsx/ts/tsx) file exists in the entry directory.

---

:x: **Error**  
invalid path

**Message**

```
Error: (build-schema) invalid path "undefined", please provide a valid directory or file path as your first argument (e.g. "./src")
```

This error may occur in the following scenarios:

1. The first argument to `react-diagram-schema` was omitted.
2. An invalid first argument was provided (for example, the file path or directory does not exist).

_Hint:_  
_Ensure the current directory and first argument are valid before running `react-diagram-schema` (example argument: `./components`)_

---

:x: **Error**  
invalid component name

**Message**

```
Error: (build-schema) invalid component name "app", please provide a valid component name as your second argument (e.g. "App")
```

This error may occur in the following scenarios:

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

This warning may occur in the following scenarios:

1. The file indicated in `<file-path>` does not exist or could not be found by the parser.

_Hint:_  
_Look for the file indicated in `<file-path>`_

## About JSON Schema

- The schema stores parsed components as objects, parses each component's:
  - name
  - description (the component's purpose, which will be integrated post-MVP using inline comments)
  - descendants (the component's direct children)
  - location (more specifically, the file path and declaration line)

---

- The schema stores the parsed components' **internally defined** data such as:
  - states and state setters
  - function declarations

---

- The schema stores the parsed components' **input** data such as:
  - props
  - context dependencies
  - constants (which will be integrated in future releases)

---

The schema

- describes your app’s structure
- integrates seamlessly with [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) (a [ReactFlow](https://reactflow.dev/) based tool that renders the schema as an interactive UML-style diagram)
- can power your custom built tools or workflows (feel free to reuse it however you like)

## Dependencies

- [@babel/parser](https://www.npmjs.com/package/@babel/parser) - Parses JavaScript code into an AST
- [@babel/traverse](https://www.npmjs.com/package/@babel/traverse) - Walks the AST and extracts component data
- [typescript](https://www.npmjs.com/package/typescript) - Compiles TypeScript/TSX files into JavaScript/JSX

## Limitations

This CLI tool currently parses JavaScript (`.js` / `.jsx`) and TypeScript (`.ts` / `.tsx`) files but does not extract additional information from TypeScript files.

Extracting types from `.ts` / `.tsx` files is a planned feature that could be introduced in the future. To learn more regarding next steps and future plans, check out the [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) document.

## Roadmap

Please visit [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) to view the project's progress, and planned features.

## Contributing

Please visit [CONTRIBUTING.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/CONTRIBUTING.md) to learn about how you can contribute to `react-diagram-schema`.

## License

[MIT](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/LICENSE.md)
