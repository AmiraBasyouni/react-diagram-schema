# react-diagram-schema

Turn React components into a structured schema you can use to generate diagrams.

## Details

- Parses React source files (`.js`, `.jsx`) using `@babel/parser` and `@babel/traverse`.

- Extracts component-level data:

  - State variables (e.g., `useState` pairs)
  - Props usage
  - Context dependencies
  - Function declarations
  - (Plus source file name and location metadata — line/column)

- Generates a standardized JSON schema describing your app’s structure

- Integrates seamlessly with [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) to visualize component hierarchies and relationships

- Versatile schema output — the JSON can power other tools or workflows; feel free to reuse it however you like

## Example

Input: `AppPlayground.js`

Output Schema:

```json
{
  "filename": "AppPlayground.js",
  "components": [
    {
      "name": "App",
      "description": "",
      "descendants": [
        {
          "name": "Header",
          "sourceFile": "AppPlayground.js",
          "location": {
            "line": 28,
            "column": 6
          }
        },
        {
          "name": "Content",
          "sourceFile": "AppPlayground.js",
          "location": {
            "line": 33,
            "column": 8
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
        "start": {
          "line": 8,
          "column": 0,
          "index": 217
        },
        "end": {
          "line": 37,
          "column": 1,
          "index": 1023
        }
      }
    }
  ]
}
```

## Get Started

```bash
git clone https://github.com/AmiraBasyouni/react-diagram-schema
```

```bash
cd react-diagram-schema
```

```bash
npm install
```

build the schema using:

```bash
node src/build-schema.js test-components/AppPlayground.js
```

or, if installed globally, using: 

```bash
npx build-schema ./fileName.js
```

## Roadmap

See [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) for next steps and feature plans.

## License

MIT
