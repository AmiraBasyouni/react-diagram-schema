#!/usr/bin/env node

/* (cli.js) This File Runs Command Line Logic */

// imports
const fs = require("fs");
const isFile = require("./utils/isFile");
const buildSchema = require("./build-schema");
const generateSchemaFile = require("./generateSchemaFile");

// parseFlags: a function that parses user input and sets verbosity level
// flags: stores the state of each flag
// rest: stores the remaining user input
function parseFlags(argv) {
  const flags = { quiet: false, verbose: false, debug: false };
  const rest = [];
  for (const a of argv) {
    if (a === "--quiet") flags.quiet = true;
    else if (a === "--verbose") flags.verbose = true;
    else if (a === "--debug") flags.debug = true;
    else rest.push(a);
  }
  // overwrite precedence: quiet > debug > verbose
  if (flags.quiet) {
    flags.verbose = false;
    flags.debug = false;
  } else if (flags.debug) {
    flags.verbose = true;
  }
  return { flags, rest };
}

// declare and call the cli's main function
(function main() {
  const { flags, rest } = parseFlags(process.argv.slice(2));
  const [entryDirectory, rootComponentName] = rest;

  // Error Message: detect invalid user input <entryDirectory|entryFile>
  if (
    typeof entryDirectory != "string" ||
    (!isFile(entryDirectory) && !fs.existsSync(entryDirectory))
  ) {
    throw new Error(
      `(build-schema) invalid path "${entryDirectory}", please provide a valid directory or file path as your first a  rgument (e.g. "./src")`,
    );
  }

  // Error Message: detect invalid user input [rootComponentName]
  if (
    typeof entryComponentName === "string" &&
    !/^--/.test(rootComponentName) &&
    !/^[A-Z]/.test(rootComponentName)
  ) {
    // (when no component name is provided, assume a default export is available)
    // guard against invalid component names (if component name is provided)
    throw new Error(
      `(build-schema) invalid component name "${rootComponentName}", please provide a valid component name as your s  econd argument (e.g. "App")`,
    );
  }

  const schema = buildSchema(entryDirectory, rootComponentName, flags);

  // write schema to file
  generateSchemaFile(schema, flags);
})();
