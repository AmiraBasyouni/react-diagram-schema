#!/usr/bin/env node

/* (cli.js) This File Executes the Command Line Logic */

// import
const runCli = require("./cli-core");

// Capture the *actual* directory where the user invoked the command
// before npx/monorepo tools can change it
const actualCwd = process.env.INIT_CWD || process.cwd();

// runCli() parses user CLI input, generates schema, and saves schema to a file
// returns the schema's file location
runCli(process.argv.slice(2), actualCwd);
