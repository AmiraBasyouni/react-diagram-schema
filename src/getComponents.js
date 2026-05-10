// getComponents.js

//const parseFile = require("./parseFile");
const verifyReactComponents = require("./verifyReactComponents");
const parseReactComponents = require("./parseReactComponents");

function getComponents(parsedCode, filePath) {
  //const topLevelDeclarations = parseFile(sourceCode);
  const verifiedComponents = verifyReactComponents(parsedCode);
  const components = parseReactComponents(verifiedComponents, filePath);
  return components;
}

module.exports = getComponents;
