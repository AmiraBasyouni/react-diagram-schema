// edgeCases/cases/nestedComponents.cases.js

const cases = [
  {
    name: "Extract Component nested in component factory",
    code: `const Component = memo(NestedComponent);`,
    expected: { components: ["Component"] },
  },
  {
    name: "Extract Descendant nested in a conditional JS Expression",
    code: `function Component(){ 
	    return <>{ condition && <HomePage /> }</> 
           }`,
    expected: {
      components: ["Component"],
      unresolvedDescendants: { Component: ["HomePage"] },
    },
  },
  {
    name: "Extract Descendant nested in a map within a JS Expression: identifier",
    code: `function Component(){ 
        return <>
            { SECTION.map(({id, component})=> {
              const Section = component; 
              return <Section id={id}/>
            }) }
        </>
      }`,
    expected: {
      components: ["Component", "Section"],
      descendants: { Component: ["Section"] },
    },
  },
  {
    name: "Extract Descendant nested in a map within a JS Expression: MemberExpression",
    code: `function Component(){ 
        return <>
            { SECTION.map((section)=> {
              const Section = section.component; 
              const Section2 = () => <Hello/>
              return <Section id={section.id}/>
            }) }
        </>
      }`,
    expected: {
      components: ["Component", "Section"],
      descendants: { Component: "Section" },
    },
  },
  {
    name: "component with a nested inline component is detected and marked as nested",
    code: `function NestedStructure() {
        const Wrapper = () => <div>Nested component</div>;
        return <Wrapper />;
       }`,
    expected: {
      components: ["NestedStructure", "Wrapper"],
      descendants: { NestedStructure: "Wrapper" },
    },
  },
  {
    name: "component with a nested function-defined component is detected and marked as nested",
    code: `function ParentComponent() {
        function ChildComponent() {
          return <span>Nested function-defined</span>;
        }
        return <ChildComponent />;
      }`,
    expected: {
      components: ["ParentComponent", "ChildComponent"],
      descendants: { ParentComponent: "ChildComponent" },
    },
  },
];

module.exports = cases;
