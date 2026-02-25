// componentIsDeclaredInCode.js
// objective: given a string of code and a component's name, check whether the component was declared within the given code string

//code: object
//componentName: string
//entryComponent: boolean
function componentIsDeclaredInCode(
  topLevelDeclarations,
  componentName,
  isEntryComponent,
) {
  //const topLevelDeclarations = parseFile(code);
  const { functions, constants, exports, classes } = topLevelDeclarations;
  for (const func of functions) {
    const { declaration } = func;
    const name = declaration.node.id.name;
    if (name === componentName && isEntryComponent) return true;
  }
  for (const constant of constants) {
    const { declarator } = constant;
    const name = declarator.node.id.name;
    if (name === componentName && isEntryComponent) return true;
  }
  for (const aClass of classes) {
    const { declaration } = aClass;
    const name = declaration.node.id.name;
    if (name === componentName && isEntryComponent) return true;
  }
  for (const anExport of exports) {
    const { declaration } = anExport;
    const name = declaration.node.id ? declaration.node.id.name : "";
    if (name === componentName && isEntryComponent) return true;
  }
}

module.exports = componentIsDeclaredInCode;
