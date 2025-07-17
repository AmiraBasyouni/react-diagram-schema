#!/usr/bin/env node

// imports
const parseCode = require("./parseCode");
const readSourceFile = require("./readSourceFile");
const generateSchemaFile = require("./generateSchema");

// project setup
const inputFile = process.argv[2];
const { code, filename } = readSourceFile(inputFile);

const components = parseCode(code, filename, "./");

// array to collect warnings related to insufficient data
const warnings = [];

// OUTPUT TO CONSOLE!!
console.dir(components, { depth: null, colors: true });
warnings.forEach((warning) => console.warn(warning));

// OUTPUT TO FILE
generateSchemaFile(components);
