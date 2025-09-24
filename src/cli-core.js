/* (cli-core.js) This File Contains Command Line Logic */

// imports
const buildSchema = require("./build-schema");
const generateSchemaFile = require("./generateSchemaFile");

// parseFlags
// 1. recieves the command line user input process.argv.slice(2)
// 2. traverses the user input <entryDirectory> [rootComponentName] [flags]
// 3. sets verbosity levels by parsing flags
// 4. returns verbosity levels and the remaining user input (i.e. <entryDirectory> [rootComponentName] without flags)
function parseFlags(argv) {
  // default flags settings
  const flags = {
    quiet: false,
    verbose: false,
    debug: false,
    outFile: "schema.json",
  };
  // the rest of the user input (i.e. <entryDirectory> [rootComponentName]) without the flags
  const rest = [];

  // set verbosity levels based on the user input's flags
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--quiet") flags.quiet = true;
    else if (a === "--verbose") flags.verbose = true;
    else if (a === "--debug") flags.debug = true;
    else if (a === "--out" || a === "--output") {
      flags.outFile = argv[i + 1];
      i++; // skip the next arg since it's the filename
    } else rest.push(a); // if not a flag, append to this array
  }

  // overwrite verbosity levels based on the precedence: quiet > debug > verbose
  if (flags.quiet) {
    flags.verbose = false;
    flags.debug = false;
  } else if (flags.debug) {
    flags.verbose = true;
  }

  // return verbosity levels and the remaining user input
  return { flags, rest };
}

// runCli
// 1. recieves the command line user input process.argv.slice(2)
// 2. parses input using parseFlags() to recieve verbosity levels + the rest of the input
// 3. creates a schema using buildSchema()
// 4. writes the schema to a file
// 5. returns the file's location for optional further analysis
function runCli(args) {
  const { flags, rest } = parseFlags(args);
  const [entryDirectory, rootComponentName] = rest;

  // create a schema based on the user's project structure
  const schema = buildSchema(entryDirectory, rootComponentName, flags);

  // write the schema to a file
  generateSchemaFile(schema, flags);

  // return the file's location for optional further analysis
  return flags.outFile;
}

module.exports = runCli;
