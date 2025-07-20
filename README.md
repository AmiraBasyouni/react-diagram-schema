# react-diagram-schema

`react-diagram-schema` is a CLI tool that take a React source code directory and turns it into a structured schema.
The schema can be handed to [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) to generate a visual diagram of your React application.

## Installation

```bash
git clone https://github.com/AmiraBasyouni/react-diagram-schema
```

```bash
cd react-diagram-schema
```

```bash
npm install
```

## Usage

**when installed locally,**  
generate the schema of the test components application using:

```bash
npm run build-schema ./test-components/ App
```

or using:

```bash
npx build-schema ./test-components/ App
```

**when installed globally,**  
generate the schema of any component file using:

```bash
npx build-schema ./src/ App
```

_replace ./src/ with your application's entry directory_
_App represents your entry component living in your entry directory_

## Example

Input: `./test-components/ App`

Outputs a schema.json file containing:

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

## Implementation Details

- Parses a React source file (`.js`, `.jsx`) using `@babel/parser` and `@babel/traverse`.

- Extracts component-level data:
  - states and state setters
  - props
  - context dependencies
  - function declarations
  - source filename and declaration line

- Generates a standardized JSON schema describing your app’s structure

- Versatile schema output — the JSON can power other tools or workflows; feel free to reuse it however you like

- Integrates seamlessly with [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) which generates a visual diagram of your application.

## Roadmap

See [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) for next steps and feature plans.

## License

MIT
