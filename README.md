# react-diagram-schema

`react-diagram-schema` is a CLI tool that transforms React source code into a JSON schema. The schema can be handed to [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) (a companion ReactFlow based tool that renders the schema as an interactive diagram)

## Requirements
This CLI tool currently only supports parsing `.js` / `.jsx` files. There might be support for `.ts` / `.tsx` files in the future, as indicated in [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) (a document describing next steps and future plans)

**Project Dependencies**
- `@babel/parser`
- `@babel/traverse`

## How To Install

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

## How To Use

**If Not Installed, Use:**  

```bash
npx AmiraBasyouni/react-diagram-schema ./src/ App
```

_replace `./src/` with your application's entry directory._  
_`App` represents the root React component living in your entry directory._

---

**If Installed Locally, Use:**  
generate the test schema within `react-diagram-schema`'s root folder using:

```bash
./src/build-schema ./test-components/ App
```

---

**If Installed Globally, Use:**  
generate the schema from any directory using:

```bash
build-schema ./src/ App
```

_replace `./src/` with your application's entry directory._  
_`App` represents the root React component, defined in the entry directory's main file._

## Usage Example

**Scenario:** You have installed `react-diagram-schema` locally on your device. You are in the repository's root folder.

**You run the command:** `./src/build-schema ./test-components/ App`

**A schema.json file is created containing the following:**

```json
{
  "App::../test-components/App.js": {
    "name": "App",
    "description": "",
    "descendants": [
      "Header::../test-components/Header.js",
      "Content::../test-components/App.js"
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
      "filepath": "../test-components/App.js"
    }
  },
  "Content::../test-components/App.js": {
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
      "filepath": "../test-components/App.js"
    }
  },
  "Header::../test-components/Header.js": {
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
      "filepath": "../test-components/Header.js"
    }
  }
}
```
Visit [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) for instructions on how to render a schema as an interactive diagram.

You can also pass the schema to custom tools for analysis.

## Implementation Details

- Parses a React source file (`.js`, `.jsx`) using `@babel/parser` and `@babel/traverse`.

- Extracts component-level data:
  - states and state setters
  - props
  - context dependencies
  - function declarations
  - component declarations' file path

- Generates a standardized JSON schema describing your app’s structure

- Versatile schema output — the JSON can power other tools or workflows; feel free to reuse it however you like

- Integrates seamlessly with [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) which generates a visual diagram of your application.

## Common Errors and Warnings

```
Error: (build-schema) invalid path undefined, please provide a valid directory as your first argument (e.g. "./src")
```

This error could indicate one of the following:
1. you forgot to pass a first argument to the `build-schema` executable.
2. you passed an invalid first argument to the `build-schema` executable.  

- _**Hint:** Make sure your first argument is a valid directory path (e.g. `./components`)_

---

```
Error: (build-schema) invalid component name undefined, please provide a valid component's name as your second argument (e.g. "App")
```

This error could indicate one of the following:
1. you forgot to pass a second argument to the `build-schema` executable.
2. you passed an invalid second argument to the `build-schema` executable.  

- _**Hint:** Make sure your second argument is the name of the component defined in your main file (e.g. App defined in App.js or ComponentName defined in index.js)_

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
2. the descendant was declared with an in-line function, which is not currently supported.

- _**Hint:** Look for the file indicated in `<file-path>`. If it exists, check if `<component-name>` was declared as an in-line function_

## Roadmap

Please visit [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) to view the project's progress, planned features, and how you can contribute.

## License

MIT
