#!/usr/bin/env node

/* (cli.js) This File Executes the Command Line Logic */

// import
const runCli = require("./cli-core");

// runCli() parses user CLI input, generates schema, and saves schema to a file
// returns the schema's file location
runCli(process.argv.slice(2));
