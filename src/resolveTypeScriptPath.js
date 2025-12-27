const ts = require("typescript");
const path = require("path");

function resolveTypeScriptPath(fromFile, importedName) {
  // Find the nearest tsconfig.json
  const configPath = ts.findConfigFile(
    path.dirname(fromFile),
    ts.sys.fileExists,
    "tsconfig.json",
  );

  if (!configPath) {
    throw new Error("Could not find tsconfig.json");
  }

  const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    path.dirname(configPath),
  );

  // Resolve using TypeScript's module resolution
  const resolved = ts.resolveModuleName(
    importedName,
    fromFile,
    options,
    ts.sys,
  );

  return resolved.resolvedModule?.resolvedFileName;
}

module.exports = resolveTypeScriptPath;
