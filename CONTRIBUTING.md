# Contributing to react-diagram-schema

Thank you for your interest in contributing! :tada:  
`react-diagram-schema` is a standalone CLI tool that generates a JSON schema from React source code, designed to integrate with [`react-diagram-visualizer`](https://github.com/AmiraBasyouni/react-diagram-visualizer) for visualizing [ReactFlow](https://reactflow.dev/)-based UML diagrams. We aim to make React component architecture more **visual, structured, and developer-friendly**, and your help can make a big difference.

## How to Get Started

1. Fork this repository:

- visit [`react-diagram-schema`](https://github.com/AmiraBasyouni/react-diagram-schema)
- click Fork at the top right of the repo page

   <!--- alternatively, if you have gh set up on your terminal, use the following command:
   ```bash
   gh repo fork AmiraBasyouni/react-diagram-schema
   ```
   --->

2. Clone your fork:

   ```bash
   git clone https://github.com/<your-username>/react-diagram-schema.git
   ```

   Note  
   :memo: replace `<your-username>` with your GitHub username.

3. Visit the root directory:

   ```bash
   cd react-diagram-schema
   ```

4. Install project dependencies:
   ```bash
   npm install
   ```

## How You Can Contribute

We welcome:

- **Bug fixes:** Spotted something weird? Open an issue or submit a fix.
- **Schema enhancements:** Improve how we extract data like props or states from React files.
- **Plugin ideas:** Suggest or prototype tools that consume the schema (e.g., a linter using the schema to enforce ‘no circular dependencies’ or a VS Code extension showing component trees).
- **Performance improvements:** Optimize parsing for large React projects.
- **Documentation updates:** Even fixing a typo helps!

Try to avoid:

- Large refactors without discussion.
- Adding unrelated dependencies.

## Proposing Changes

Before starting major work:

- **Open an issue** describing your proposal.
- If relevant, share an example schema and how your change would improve the output.

Small fixes (typos, minor code tweaks) can skip this step.

## Coding Standards

- **Formatting**: We use Prettier and ESLint. Run `npm run lint` and `npm run format` before submitting.
- **File Naming**: use camelCase for utility helpers (e.g., parseCode.js), and kebab-case for core modules (e.g., build-schema.js).
- **Schema Shape**: Keep the structure consistent with the current spec:

  ```js
  {"ComponentName::filepath": {"name": "App", "descendants": ["Header"], "location": {"line": 7}}}
  ```

  Note  
   :memo: This is a simplified example.  
   :memo: To see the full schema specification, visit [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema).

## Pull Requests

1. **Branch** from main:

   ```bash
   git checkout -b fix-bug-header
   ```

   Note  
   :memo: replace `fix-bug-header` with a branch name related to the fix or feature you'd like to implement.

2. **Write commits in [Conventional Commits](https://www.conventionalcommits.org/) style**:  
   Use a prefix like `fix`, `feat`, `chore`, or `docs`, followed by the scope (e.g. `extractMetadata`, `readme`) and add a brief description.

   Examples:

- `fix(extractMetadata): improve props parsing for RestElement`
- `feat: add support for React.lazy components`
- `docs(readme): clarify multi-file parsing usage`

3. **Push** your branch and open a pull request on GitHub.

4. Include **screenshots or schema output** in your pull request if your changes affect the schema structure or visualization (e.g., new schema fields or diagram updates).

## Sign-off (DCO)

This project enforces the [Developer Certificate of Origin (DCO)](https://developercertificate.org/).  
All commits must be signed off to confirm you have the right to submit the code.

**How to sign off a commit?**

When making commits, use the `-s` flag:

```bash
git commit -s -m "feat: add new schema flag"
```

This automatically adds a `Signed-off-by: Your Name <email>` line to the commit message.

**How to fix a missing sign-off?**

If you forgot to sign off, you can amend the most recent commit:

```bash
git commit --amend -s --no-edit
git push --force-with-lease
```

For multiple commits in a branch, you can rebase with:

```bash
git rebase -i origin/main --exec "git commit --amend -s --no-edit"
git push --force-with-lease
```

**Email Tip**

If you use GitHub’s “Keep my email address private” setting, make sure your sign-off email matches your `username@users.noreply.github.com` address.

Pull requests cannot be merged until all commits include a valid sign-off.

## Testing your Changes

`react-diagram-schema` includes an automated test suite powered by [Jest](https://jestjs.io/).

**Running the tests**

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npx jest tests/components.test.jsx
```

Note  
:memo: This command assumes you are at the root directory.

---

**Test types included**

- **Component detection tests**:  
  Validate that function-defined and inline components are correctly parsed.

- **Data extraction tests**:  
  Ensure props, states, context, and functions are accurately extracted from components.

- **Edge case tests**:  
  Handle tricky structures like nested components, default exports, and files with missing metadata.

---

**Adding new tests**

- Add test files under the `tests/` directory. Use a feature-based structure (e.g. `components.test.jsx`, `dataExtraction.test.jsx`, `edgeCases.test.jsx`).

- Use `parseCode(code, filePath)` as your entry point for schema generation.

- Keep tests isolated and easy to understand.  
  Example:

  ```JavaScript
  expect(result["MyComponent::file.js"].external.props).toContain("title");
  ```

- Prefer `Object.keys(result)` to validate which components are detected.  
  Example:
  ```js
  const keys = Object.keys(result);
  expect(keys).toContain(`App::${fakePath}`);
  ```

---

**Manual testing**

Automated tests catch most issues, but you can also test the CLI manually.

:flashlight: **Try parsing a single component**

1. Follow the [How To Get Started](#how-to-get-started) instructions.

2. Inside `./react-diagram-schema/`, create a `playground/` directory:

   ```bash
   mkdir playground
   ```

3. Visit the `playground/` directory:

   ```bash
   cd playground
   ```

4. Create a file `Header.jsx`

   ```bash
   touch Header.jsx
   ```

5. Edit the file by adding this component:

   ```JavaScript
   function Header(){
     return <h1>Hello World!</h1>;
   }
   ```

6. Run the parser on this component with the debug flag:

   ```bash
   node ../src/build-schema.js ./playground/ Header --debug
   ```

7. The console output should look as follows:

   ```js
   {
     'Header::Header.jsx': {
       name: 'Header',
       description: '',
       descendants: [],
       internal: { states: [], functions: [] },
       external: { props: [], context: [], constants: [] },
       defaultExport: false,
       location: { line: 1, filepath: 'Header.jsx' },
       unresolvedDescendants: undefined
     }
   }
   ```

   Note  
   :memo: The `playground/` directory will be ignored.  
   :memo: Changes made to the `playground/` directory will not be committed.

---

:file_folder: **Try parsing a repository**

1. Follow the [How To Get Started](#how-to-get-started) instructions.

2. Inside the root directory, create a symbolic link:

   ```bash
   npm link
   ```

   Note  
   :memo: The symbolic link makes `react-diagram-schema` globally accessible.  
   :memo: To view npm links, run `npm ls -g --depth=0 --link=true`.  
   :memo: After testing, you can remove the link by running `npm unlink -g react-diagram-schema`.

3. Leave `react-diagram-schema`'s root directory (in other words, go one level up):

   ```bash
   cd ../
   ```

4. Clone a React repository (e.g. [`xyflow`](https://github.com/xyflow/xyflow)):

   ```bash
   git clone https://github.com/xyflow/xyflow.git
   ```

5. Run the parser against the cloned repository:

   ```bash
   build-schema ./xyflow/examples/react/src/App/
   ```

   Note  
   :memo: Adjust the arguments as needed (the first for the entry directory/file, and optionally the second for the root component name).

6. Open and inspect the generated `schema.json` file from your current working directory.

   Note  
   :memo: The parser writes `schema.json` to the current working directory (where you ran the command).

   Check for:
   - The number of components detected.
   - Any missing or unresolved descendants.
   - Warnings or errors in the console

   Note  
   :memo: If performance issues occur, feel free to open an issue to discuss improvements.

7. (Recommended) Visualize the schema with [`react-diagram-visualizer`](https://github.com/AmiraBasyouni/react-diagram-visualizer) to see how the component tree renders.

---

**Visualizing the output**

You can visualize `schema.json` using [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer)

1. Clone the visualizer:

   ```bash
   git clone https://github.com/AmiraBasyouni/react-diagram-visualizer.git
   ```

2. Visit the root directory and install dependencies:

   ```bash
   cd react-diagram-visualizer
   ```

   ```bash
   npm install
   ```

3. Place your `schema.json` file inside the `src/` folder.

   ```bash
   mv ../schema.json ./src/
   ```

   Note  
   :memo: Adjust the first argument to match your `schema.json` file's location.

4. Run the visualizer:

   ```bash
   npm run dev
   ```

   You'll see a diagram rendered using ReactFlow.
   The diagram for `Header.jsx` should look like this (confirming the parser and visualizer are correctly wired):  
   ![React Flow diagram showing Header component node](assets/contributing-md-diagram-preview.png)

   Note  
   :memo: If any modifications are made to the `schema.json` file: close the diagram, stop the visualizer with `Ctrl+c`, then run `npm run dev` again to see the updates in the diagram.

## New to Open Source?

Start with small tasks like improving error messages or fixing typos in docs.

## Roadmap & Features

To view planned features and priorities, visit the [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) document.

We welcome discussions of new ideas!  
If you have a suggestion, feel free to open an issue or comment on an existing one.

## Questions?

- **Issues**: Open a [GitHub Issue](https://github.com/AmiraBasyouni/react-diagram-schema/issues).
- **Discussions**: Start a thread under [Discussions](https://github.com/AmiraBasyouni/react-diagram-schema/discussions) (coming soon).

## Thank you

Every contribution counts. Whether it's code, feedback, or docs!
