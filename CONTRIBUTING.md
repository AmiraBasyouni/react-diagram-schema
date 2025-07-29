# Contributing to react-diagram-schema

Thank you for your interest in contributing! 🎉  
`react-diagram-schema` is a standalone CLI tool that generates a JSON schema from React source code, designed to integrate with [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer) for visualizing [ReactFlow](https://reactflow.dev/)-based UML diagrams. We aim to make React component architecture more **visual, structured, and developer-friendly**, and your help can make a big difference.

## How to Get Started

1. Fork this repository

- visit [react-diagram-schema](https://github.com/AmiraBasyouni/react-diagram-schema)
- click on the button labeled "Fork"
- alternatively, if you have gh set up on your terminal, use the following command:
  ```bash
  gh repo fork AmiraBasyouni/react-diagram-schema
  ```

2. Clone your fork

   ```bash
   git clone https://github.com/<your-username>/react-diagram-schema.git
   ```

3. Install dependencies
   ```bash
   npm install
   ```

## How You Can Contribute

We welcome:

- **Bug fixes** - spotted something weird? Open an issue or submit a fix.
- **Schema enhancements** - improve how we extract data like props or states from React files.
- **Plugin ideas** - suggest or prototype tools that consume the schema (e.g., a linter using the schema to enforce ‘no circular dependencies’ or a VS Code extension showing component trees).
- **Performance improvements** - optimize parsing for large React projects.
- **Documentation updates** - even fixing a typo helps!

Please avoid:

- Large refactors without discussion.
- Adding unrelated dependencies.

## Proposing Changes

Before starting major work:

- **Open an issue** describing your proposal.
- If relevant, share an example schema and how your change would improve the output.

Small fixes (typos, minor code tweaks) can skip this step.

## Coding Standards

- **Formatting**: We use Prettier and ESLint.
- **File Naming**: camelCase for utilities, PascalCase for core modules.
- **Schema Shape**: Keep the structure consistent with the current spec:

```js
{"ComponentName::filepath": {"name": "App", "descendants": ["Header"], "location": {"line": 7}}}
```

Note: you can find the full schema in [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema)

## Pull Requests

1. **Branch** from main:

   ```bash
   git checkout -b fix-bug-header
   ```

2. **Write commits in [Coniventional Commits](https://www.conventionalcommits.org/) style**:  
   Use a prefix like `fix`, `feat`, or `docs`, followed by the scope (e.g., `codeParser`, `readme`) and a brief description. 
 
   Example:

- `fix(codeParser): improve props parsing for RestElement`
- `feat(parser): ass support for React.lazy components`
- `docs(readme): clarify multi-file parsing usage`

3. **Push** your branch and open a pull request on GitHub.

4. Include **screenshots or schema output** in your pull request if your changes affect parsing or visualization (e.g., new schema fields or diagram updates).

## Testing your Changes

Try parsing a single component!

Example:

- create a file `Header.jsx` in the directory `./test-components`
- inside the `Header.jsx` file, write the React component:  
  `function Header(){ return <h1>Hello World!</h1>; }`
- inside `react-diagram-schema`'s root folder, generate a schema using the following command:
  ```bash
  node ./src/build-schema.js ./test-components/ Header
  ```
- and the console should show the following schema as output:
  ```js
  {
    'Header::Header.jsx': {
      name: 'Header',
      description: '',
      descendants: [],
      internal: { states: [], functions: [] },
      external: { props: [], context: [], constants: [] },
      location: { line: 1, filepath: 'Header.jsx' },
      unresolvedDescendants: undefined
    }
  }
  ```
- from there, you can adjust your source code to ensure the generated `./schema.json` remains correct in different scenarios

If your changes affect **multi-file parsing** (i.e. your React source code (e.g. Header.jsx) imports components that live in different files), ensure cross-file components are linked correctly.

If you choose to visualize the above schema,

1. clone the react-diagram-visualizer repository
   ```bash
   git clone https://github.com/AmiraBasyouni/react-diagram-visualizer.git
   ```
2. place your schema.json file inside the src folder of `react-diagram-visualizer`
3. run the visualizer using the command:
   ```bash
   npm run dev
   ```
   The diagram should look like this:  
   ![Simple ReactFlow Diagram Demo](assets/contributing-md-diagram-preview.png)

As you add props, states, and function declarations, you should interrupt the `react-diagram-visualizer`'s processes using `Ctrl+c` and run `npm run dev` again to see the changes show up in your diagram.

## New To Open Source?

Start with small tasks like improving error messages (e.g., ‘Invalid path’) or fixing typos in docs.

## Roadmap & Features

You can view planned features and priorities in the [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md)  
If you have a suggestion, open an issue or comment on an existing one.

## Questions?

- **Issues**: Open a [GitHub Issue](https://github.com/AmiraBasyouni/react-diagram-schema/issues).
- **Discussions**: Start a thread under [Discussions](https://github.com/AmiraBasyouni/react-diagram-schema/discussions) (coming soon).

## Thank you

Every contribution counts. Whether it's code, feedback, or docs!
