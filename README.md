# react-diagram-schema

Turn React components into a structured schema you can use to generate diagrams.

## What It Does

Parses `.js`, `.jsx`, `.ts`, or `.tsx` files to extract React component logic, state, props, and other metadata into a clean JSON schema.

## Example

```ts
Input: ToastPlayground.tsx
Output Schema:
{
  "name": "ToastPlayground",
  "logic": "Renders form UI",
  "internal": {
    "states": [["message", "setMessage"]],
    "functions": ["createToast()"]
  },
  "external": {
    "props": [],
    "children": false
  }
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

```bash
npx build-schema
```

## Roadmap

See [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) for next steps and feature plans.

## License

MIT
