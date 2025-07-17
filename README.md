# react-diagram-schema

`react-diagram-schema` is a CLI tool that take a React source code file and turns it into a structured schema. 
The schema can be handed to [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) to generate a visual diagram of your components.

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
generate the schema of a test-component file using:
```bash
npm run build-schema ./test-components/AppPlayground.js
```
or using:
```bash
npx build-schema ./test-components/AppPlayground.js
```


**when installed globally,**   
generate the schema of any component file using:
```bash
npx build-schema ./MyComponent.js
```
*remember to replace MyComponent with the name of your file*

## Example

Input: `AppPlayground.js`

Outputs a schema.json file containing:

```json
{
  "App": {
    "name": "App",
    "description": "",
    "descendants": [
      {
        "name": "Header",
        "sourceFile": "AppPlayground.js",
        "location": {
          "line": 37,
          "filename": "AppPlayground.js",
          "filepath": "./"
        }
      },
      {
        "name": "Content",
        "sourceFile": "AppPlayground.js",
        "location": {
          "line": 41,
          "filename": "AppPlayground.js",
          "filepath": "./"
        }
      }
    ],
    "internal": {
      "states": [
        [
          "count",
          "setCount"
        ],
        [
          "theme",
          "setTheme"
        ]
      ],
      "functions": [
        "buttonHandler",
        "B"
      ]
    },
    "external": {
      "props": [
        "children",
        "propA",
        "propB",
        "propC"
      ],
      "context": [
        {
          "source": "FavouriteColorContext",
          "values": [
            "favouriteColor"
          ]
        },
        {
          "source": "FavouriteThemeContext",
          "values": [
            "theme1",
            "theme2"
          ]
        }
      ],
      "constants": []
    },
    "location": {
      "line": 6,
      "filename": "AppPlayground.js",
      "filepath": "./"
    }
  },
  "Header": {
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
      "line": 37,
      "filename": "AppPlayground.js",
      "filepath": "./"
    }
  },
  "Content": {
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
      "line": 41,
      "filename": "AppPlayground.js",
      "filepath": "./"
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

## Roadmap

See [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) for next steps and feature plans.

## License

MIT
