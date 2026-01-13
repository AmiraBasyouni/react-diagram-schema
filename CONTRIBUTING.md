# Contributing to react-diagram-schema

Thank you for your interest in contributing! We aim to make React component architecture more **visual, structured, and developer-friendly**, and your help can make a big difference.

You do not need to understand everything in this document to get started. Many valuable contributions are small and low-risk, such as:

- fixing typos or clarifying documentation,
- improving error messages,
- suggesting test cases,
- reporting or reproducing edge cases.

## Quick Checklist

Feel free to utilize this checklist as a reference. Small improvements, like fixing typos, do not require testing and do not utilize the steps marked as recommended.

- [ ] Fork and clone `react-diagram-schema`
- [ ] (recommended) create a symbolic link for an easier workflow
- [ ] Branch from main with `git checkout -b your-branch-name`
- [ ] For code contributions (e.g. bug fixes, performance improvements, documentation updates) open an issue. For none-code related contributions (e.g. ideation, plugin ideas) open a discussion
- [ ] Run the regression tests `npm run test` to ensure your changes don't break existing behavior
- [ ] (strongly recommended) Test your changes against a complex repository, such as [xyflow](https://github.com/xyflow/xyflow) or [cal.com](https://github.com/calcom/cal.com)
- [ ] (recommended) Visualize the generated schema using [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer)
- [ ] Push your branch and open a pull request on GitHub

## Get Started

1. Fork this repository:

   On GitHub, [`react-diagram-schema`](https://github.com/AmiraBasyouni/react-diagram-schema), click Fork at the top right of the page.

   <!--- alternatively, if you have gh set up on your terminal, use the following command:
   ```bash
   gh repo fork AmiraBasyouni/react-diagram-schema
   ```
   --->

2. Clone your fork:

   For the following command, you **must** replace `<your-username>` with your GitHub username.

   ```bash
   git clone https://github.com/<your-username>/react-diagram-schema.git
   ```

3. Visit the root directory:

   ```bash
   cd react-diagram-schema
   ```

4. Install project dependencies:

   ```bash
   npm install
   ```

5. create a symbolic link for an easier work flow:
   ```bash
   npm link
   ```
   Note
   - The symbolic link makes `react-diagram-schema` globally accessible.
   - To view npm links, run `npm ls -g --depth=0 --link=true`.
   - After testing, you can remove the link by running `npm unlink -g react-diagram-schema`.

## Avoid

Try to avoid:

- Large refactors without discussion.
- Adding unrelated dependencies.

## Opening An Issue

Anything related to modifying the code (e.g. fixing bugs, improving performance) is a good issue:

**Explore Issues**

1. On GitHub, [`react-diagram-schema`](https://github.com/AmiraBasyouni/react-diagram-schema), click on Issues at the top of the page.
2. On the search bar, you might find `is:issue state:open`. These filters are applied automatically. As you manage the filters underneath the search bar, those values might change.

**Open An Issue**

1. Click New issue
2. Select a template: (bug report, feature request, or blank issue)
3. Modify the title and description
4. Click Create

**Good Issues**

- A good issue contains examples (e.g. before and after, input and output, expected outcome vs reality).
- Each issue can benefit from a constructive discussion (value assessment, thoughtful resolutions, proactive contributions)

## Opening A Discussion

Anything not related to modifying the code, can make a good discussion:

**Explore Discussions**

1. On GitHub, [`react-diagram-schema`](https://github.com/AmiraBasyouni/react-diagram-schema), click on Discussions at the top of the page.
2. On the search bar, you might find `is:open`. These filters are applied automatically. As you manage the filters next to and below the search bar, those values might change.

**Start A Discussion**

1. Click New discussion
2. Pick a category: (Get Started, How To Contribute, Plugin Ideas, Polls, or Q&A)
3. Write a title and a description
4. Click Start Discussion

## Pull Requests

Once we've approved your issue, here are steps you can take towards modifying the code:

1. **Branch** from main:

   For the following command, you can replace `fix-bug-header` with a branch name related to the fix or feature you'd like to implement:

   ```bash
   git checkout -b fix-bug-header
   ```

2. Follow the [Coding Standards](#coding-standards) and [Commit Style](#commit-style) sections for each modification.

3. Test your changes by following the [Testing your Changes](#testing-your-changes) section.

4. **Push** your branch and open a pull request on GitHub.

5. If the changes affect the schema structure, explain those changes and why they were important. Even better, produce before and after examples so we can follow along.

## Coding Standards

- **Formatting**: We use Prettier and ESLint. Run `npm run lint` and `npm run format` before each commit.
- **File Naming**: use camelCase for utility helpers (e.g., parseCode.js), and kebab-case for core modules (e.g., build-schema.js).

## Commit Style

**Write commits in [Conventional Commits](https://www.conventionalcommits.org/) style**:  
 Use a prefix like `fix`, `feat`, `chore`, or `docs`, followed by the scope (e.g. `extractMetadata`, `readme`) and add a brief description.

Examples:

- `fix(extractMetadata): improve props parsing for RestElement`
- `feat: add support for React.lazy components`
- `docs(readme): clarify multi-file parsing usage`

### Sign-off (DCO)

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

`react-diagram-schema` uses an automated test suite powered by [Jest](https://jestjs.io/).

**regression testing**

Run the test suite to verify that your changes don't break previously working behavior.

To run all tests:

```bash
npm test
```

To run a specific test file, target the test's file path:

```bash
npx jest tests/components.test.jsx
```

---

**Adding new tests** (not required)

Below are instructions if you decide to help us out by adding more tests:

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

**Manual Testing**

Conduct manual tests to verify behavior against special cases that are not covered in the test suite

:flashlight: **Try parsing a single component**

Note: the `src/playground/` directory gets ignored automatically. You can add experimental components to the `playground/` directory and they will not be committed.

Feel free to create experimental components in the `playground/` directory and running the CLI tool.  
 Example:

```bash
react-diagram-schema ./src/playground/MyComponent.jsx
```

:file_folder: **Try parsing a repository**

The best form of testing, is verifying `react-diagram-schema`'s behavior against complex repositories.

1. Follow the [How To Get Started](#how-to-get-started) instructions.

2. Leave `react-diagram-schema`'s root directory (in other words, go one level up):

   ```bash
   cd ../
   ```

3. Clone a React repository (e.g. [`xyflow`](https://github.com/xyflow/xyflow)):

   ```bash
   git clone https://github.com/xyflow/xyflow.git
   ```

4. Run the parser against the cloned repository:

   e.g., we'll target a default exported component at `./xyflow/examples/react/src/App/index.tsx`

   ```bash
   react-diagram-schema ./xyflow/examples/react/src/App/
   ```

5. Open and inspect the generated `schema.json` file from your current working directory.

   The parser writes `schema.json` to the current working directory (where you ran the command).
   If performance issues occur, feel free to open an issue to discuss improvements.

   Check for:
   - The number of components detected.
   - Any missing or unresolved descendants.
   - Warnings or errors in the console.

6. (Recommended) Visualize the schema with [`react-diagram-visualizer`](https://github.com/AmiraBasyouni/react-diagram-visualizer) to see how the component tree renders.

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

   e.g. my `schema.json` file is located in the `../` directory

   ```bash
   mv ../schema.json ./src/
   ```

4. Run the visualizer:

   ```bash
   npm run dev
   ```

   You'll see a diagram rendered using ReactFlow.

   Note  
   :memo: If any modifications are made to the `schema.json` file: close the diagram, stop the visualizer with `Ctrl+c`, then run `npm run dev` again to see the updates in the diagram.

## New to Open Source?

Start with small tasks like improving error messages or fixing typos in docs.

## Roadmap & Features

To view planned features and priorities, visit the [ROADMAP.md](https://github.com/AmiraBasyouni/react-diagram-schema/blob/main/ROADMAP.md) document.

We welcome discussions of new ideas!  
If you have a suggestion, feel free to open an issue or comment on an existing one.

## Questions?

Start a new discussion at [Discussions](https://github.com/AmiraBasyouni/react-diagram-schema/discussions).

- pick the category "Contribution" for questions regarding how to contribute.
- pick the category "Q&A" for general inquiries regarding `react-diagram-schema`.

## Thank you

Every contribution counts. Whether it's code, feedback, or docs!
