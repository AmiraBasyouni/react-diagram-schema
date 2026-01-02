const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function resolveExport(symbolName, filePath, visited = new Set()) {
  if (!fs.existsSync(filePath)) return null;

  //console.log(`(resolveExport): Looking for "${symbolName}" in ${filePath}`);
  // Prevent infinite loops on circular re-exports
  const realPath = fs.realpathSync(filePath);
  if (visited.has(realPath)) return null;
  visited.add(realPath);

  const code = fs.readFileSync(filePath, "utf-8");

  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  let targetPath = null;

  traverse(ast, {
    ExportDefaultDeclaration() {
      if (targetPath) return;
      //console.log(`ExportDefaultDeclaration found in ${filePath}`);

      // If the symbol being asked for is the module’s default,
      // or if the original name (e.g. "ToastProvider") is being
      // resolved through an export * / re-export, map it here.
      if (
        symbolName === "default" ||
        symbolName === path.basename(filePath, path.extname(filePath))
      ) {
        //console.log(
        //  `Matched default export in ${filePath} for symbol "${symbolName}"`,
        //);
        targetPath = filePath;
        return;
      }
    },

    // Case 1: Direct re-export
    //   export { ReactFlow } from './components/ReactFlow';
    //   export { default as ToastProvider } from './ToastProvider';
    //   export { default } from './ToastProvider';
    ExportNamedDeclaration(pathNode) {
      const { node } = pathNode;

      if (targetPath) return;
      if (node.source) {
        // re-export from another file
        //console.log(
        //  `ExportNamedDeclaration: re-export from ${node.source.value}`,
        //);
        const importRel = node.source.value;
        const abs = resolveWithExtensions(
          path.resolve(path.dirname(filePath), importRel),
        );

        // A) default-as-name: export { default as <symbolName> } from './...'
        const defaultAsName = node.specifiers.find(
          (spec) =>
            spec.local.name === "default" && spec.exported.name === symbolName,
        );
        if (defaultAsName) {
          //console.log("[default-as-name] symbol:", symbolName);
          //console.log("[default-as-name] abs before resolveExport:", abs);
          targetPath = resolveExport("default", abs, visited);
          //console.log("[default-as-name] resolved targetPath:", targetPath);
          return;
        }

        // B) default-as-default: export { default } from './...'
        // If caller asked for a non-default name (e.g. "ToastProvider")
        // but this file only re-exports "default", chase the default.
        const defaultAsDefault = node.specifiers.find(
          (spec) =>
            spec.local.name === "default" && spec.exported.name === "default",
        );
        if (defaultAsDefault && symbolName !== "default") {
          targetPath = resolveExport("default", abs, visited);
          return;
        }

        // C) Exact name: export { <symbolName> } from './...'
        const direct = node.specifiers.find(
          (spec) => spec.exported.name === symbolName,
        );
        if (direct) {
          // try to recurse. If you can't, you've arrived.
          let recurse = resolveExport(symbolName, abs, visited);
          targetPath = recurse ? recurse : abs;
          return;
        }
      } else if (node.declaration) {
        //console.log(`ExportNamedDeclaration: local declaration`);
        // Case 2: Declared in this file
        const decl = node.declaration;

        // function Foo() {} export { Foo }
        if (decl.id && decl.id.name === symbolName) {
          targetPath = filePath;
          return;
        }

        // const Foo = ...; export { Foo }
        if (
          decl.declarations &&
          decl.declarations.some((d) => d.id.name === symbolName)
        ) {
          targetPath = filePath;
          return;
        }
      }
    },

    // Case 3: Wildcard re-export
    //   export * from './components';
    ExportAllDeclaration(pathNode) {
      const { node } = pathNode;
      if (!node.source || targetPath) return;
      //console.log(
      //  `ExportAllDeclaration: wildcard re-export from ${node.source.value}`,
      //);

      const abs = resolveWithExtensions(
        path.resolve(path.dirname(filePath), node.source.value),
      );

      // Recurse into the target file
      //console.log(`Recursing into ${abs} for symbol "${symbolName}"`);
      const recursive = resolveExport(symbolName, abs, visited);

      // If symbolName matches the file's default export, catch it here
      if (!recursive && symbolName === path.basename(abs, path.extname(abs))) {
        // For example: ./ToastProvider -> "ToastProvider"
        const baseName = path.basename(abs, path.extname(abs));
        if (symbolName === baseName) {
          targetPath = abs;
        }
      } else if (recursive) {
        targetPath = recursive;
      }
    },
  });
  //if (targetPath) {
  //  console.log(`Match: "${symbolName}" resolved to ${targetPath}`);
  //}

  return targetPath;
}

// Helper: resolve extensions like .ts/.tsx/.js/.jsx
function resolveWithExtensions(basePath) {
  const exts = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    "/index.ts",
    "/index.tsx",
    "/index.js",
    "/index.jsx",
  ];
  for (const ext of exts) {
    const candidate = basePath.endsWith(ext) ? basePath : basePath + ext;
    if (fs.existsSync(candidate)) return candidate;
  }
  return basePath; // fallback
}

module.exports = resolveExport;
