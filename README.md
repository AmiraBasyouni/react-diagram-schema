# react-diagram-schema

Turn React components into a structured schema you can use to generate diagrams.

## What It Does

Parses `.js`, `.jsx`, `.ts`, or `.tsx` files to extract React component logic, state, props, and other metadata into a clean JSON schema.

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
      "internal": {
        "states": [
          [
            "count",
            "setCount"
          ]
        ],
        "functions": []
      },
      "external": {
        "props": [],
        "context": [],
        "constants": []
      },
      "location": {
        "start": {
          "line": 4,
          "column": 0,
          "index": 59
        },
        "end": {
          "line": 16,
          "column": 1,
          "index": 331
        }
      }
    }
  ]
}
```

## Get Started

```bash
git clone https://github.com/yourusername/react-diagram-schema
```

```bash
cd react-diagram-schema
```

```bash
npm install
```

build the schema using:

```bash
node build-schema.js ../test-components/AppPlayground.js
```

or, if installed globally, using: 

```bash
npx build-schema ./fileName.js
```

## Roadmap

See [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) for next steps and feature plans.

## License

MIT
