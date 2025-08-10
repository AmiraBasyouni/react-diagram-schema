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

This CLI tool currently parses JavaScript (`.js` / `.jsx`) and TypeScript (`.ts` / `.tsx`) files but does not extract additional information from TypeScript files. Extracting types from `.ts` / `.tsx` files is a planned feature that could be introduced in the future. To learn more regarding next steps and future plans, check out the [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) document.

**Major Dependencies**

- [@babel/parser](https://www.npmjs.com/package/@babel/parser) - Parses JavaScript code into an AST
- [@babel/traverse](https://www.npmjs.com/package/@babel/traverse) - Walks the AST and extracts component data

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
npm install -g AmiraBasyouni/react-diagram-schema
```

## Arguments

The CLI tool accepts two positional arguments:

1. `<entryDirectory>` (required)  
   Path to your application's entry directory.  
   Example: `./src/`

2. `[rootComponentName]` (optional)  
   Name of the root React component defined in your entry directory’s main file.  
   If omitted, the tool will attempt to auto-detect the root component automatically.  
   Example: `App`

## Usage

**If Not Installed,**

run the CLI directly with `npx`:

```bash
npx AmiraBasyouni/react-diagram-schema <entryDirectory> [rootComponentName]
```

Example:

```bash
npx AmiraBasyouni/react-diagram-schema ./src/components/App/ App
```

---

**If Installed Locally,**

run from the project root:

```bash
./src/build-schema <entryDirectory> [rootComponentName]
```

Example:

```bash
./src/build-schema ./sample-components/ Button
```

---

**If Installed Globally,**

run from any directory:

```bash
build-schema <entryDirectory> [rootComponentName]
```

Example:

```bash
build-schema ./ Header
```

---

## Example Usage

**Setup:** You have `react-diagram-schema` installed locally. You are in the repository's root folder.

**Usage:** `./src/build-schema ./sample-components/ App`

**Result:**  
The following `schema.json` file will be created:

```json
{
  "App::../sample-components/App.js": {
    "name": "App",
    "description": "",
    "descendants": [
      "Header::../sample-components/Header.js",
      "Content::../sample-components/App.js"
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
    "location": {
      "line": 7,
      "filepath": "../sample-components/App.js"
    }
  },
  "Content::../sample-components/App.js": {
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
    "location": {
      "line": 43,
      "filepath": "../sample-components/App.js"
    }
  },
  "Header::../sample-components/Header.js": {
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
    "location": {
      "line": 3,
      "filepath": "../sample-components/Header.js"
    }
  }
}
```

Visit [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) for instructions on how to render a schema as an interactive diagram.

The above schema should give you the following diagram:
![ReactFlow Diagram](assets/readme-md-diagram-preview.png)

You can also pass the schema to custom tools for analysis.

## Flags

**Silence**  
Purpose: mutes error and warning console messages.  
Usage: append `--silent` or `--quiet` to the end of your command like so:

```bash
build-schema ./components/App App --silent
```

**Verbose**  
Purpose: prints all error and warning console messages.  
Usage: append `--verbose` to the end of your command like so:

```bash
build-schema ./components/App App --verbose
```

## Troubleshooting

```
Error: (build-schema) invalid path "./Button.js", please provide a valid directory as your first argument (e.g. "./src")
```

This error could indicate one of the following:

1. you forgot to pass an entry directory as your first argument to the `build-schema` executable.
2. you passed an invalid entry directory (e.g. you passed a file path instead of a directory) to the `build-schema` executable.

- _**Hint:** Make sure your first argument is a valid directory path (e.g. `./components`)_

---

```
Error: (build-schema) invalid component name "app", please provide a valid component's name as your second argument (e.g. "App")
```

This error could indicate one of the following:

1.  you passed an invalid component name to the `build-schema` executable.

- _**Hint:** Make sure your second argument is the name of the component defined in your main file (e.g. App defined in App.js or some ComponentName defined in index.js)_

---

```
Error: (isFile) Error: ENOENT: no such file or directory, stat '../react-feather'
```

This error could indicate one of the following:

1. you've imported an npm package that does not exist in your local directory
2. your import statement references a file path that does not exist

- _**Hint:** in scenario 1, you can safely ignore this error message. Otherwise, check if the file path referenced in your import statement exists_

---

```
WARNING: (build-schema) the descendant <descendant-name> of component <component-name> could not be resolved within the file <file-path>
```

This warning could indicate one of the following:

1. the import statement of `<descendant-name>` is missing or could not be parsed.

- _**Hint:** check if an import statement of `<descendant-name>` exists. If so, check if the format of your import statement is supported by the parser_

---

```
WARNING: (build-schema) could not resolve file path from directory <directory> with the import path <file-path> for component <component-name>
```

This warning could indicate one of the following:

1. the file indicated in `<file-path>` does not exist or could not be found by the parser.
2. the descendant was imported from `node_modules` (if this is the case, then you can safely ignore this warning).

- _**Hint:** Look for the file indicated in `<file-path>`_

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

[MIT](https://raw.githubusercontent.com/AmiraBasyouni/react-diagram-schema/refs/heads/main/LICENSE.md)
