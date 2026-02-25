// getSchema.js

//const parseFile = require("./parseFile");
const verifyReactComponents = require("./verifyReactComponents");
const parseReactComponents = require("./parseReactComponents");

function getSchema(topLevelDeclarations, filePath) {
  //const topLevelDeclarations = parseFile(sourceCode);
  const verifiedComponents = verifyReactComponents(topLevelDeclarations);
  const components = parseReactComponents(verifiedComponents, filePath);
  return components;
}

module.exports = getSchema;
