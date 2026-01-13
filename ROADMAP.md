# Roadmap of react-diagram-schema

This roadmap describes the **direction and evolution** of `react-diagram-schema`: a static analysis tool that turns React source code into a structural schema for visualization and downstream tooling.

## Phase 1: Foundation (Complete)

**Purpose**  
Statically parse React components and generate a usable JSON schema.

**Outcome**  
`react-diagram-schema` can reliably parse complex real-world React codebases (e.g. [xyflow](https://github.com/xyflow/xyflow) and [cal.com](https://github.com/calcom/cal.com)), resolve component relationships across files, and produce schemas that downstream tools can depend on.

This phase validated that the core idea is technically sound and robust enough to serve as infrastructure rather than a demo.

:pencil2: Current Schema Design:

```js
"ComponentName::filepath": {
    "name": "",
    "description": "",
    "descendants": [],
    "internal": { "states": [], "functions": [] },
    "external": { "props": [], "context": [], "constants": [] },
    "defaultExport": false,
    "isEntryComponent": false,
    "location": { line, filepath }
}
```

## Phase 2: Early Validation

**Purpose**  
Confirm that the tool is understandable and useful without direct guidance from its author.

**Focus areas**

- Onboarding clarity (README-only usage)
- Real-world usability on unfamiliar codebases
- Identifying friction, confusion, or misaligned assumptions

**Success looks like**

- A small group of developers can run the tool successfully
- The schema output is understandable and trusted
- Feedback reveals clear improvement priorities rather than fundamental flaws

## Phase 3: Product-Market Fit

**Purpose**  
Refine the tool based on real usage patterns, and align `react-diagram-schema` with the needs of developers working on medium-to-large React applications.

**Focus areas**

- Performance and scalability
- Schema expressiveness (especially for TypeScript users)
- Structural metadata that improves visualization and analysis

**Direction**  
This phase is about deepening value, not adding novelty. Features are prioritized only if they strengthen the schema as a dependable representation of application architecture.

## Phase 4: Scale & Integration

**Purpose**  
Position `react-diagram-schema` as a foundation for higher-level developer tooling.

**Focus areas**

- Tooling integrations (IDE, CI, automation)
- Schema-driven validation and analysis
- Making architectural intent observable and enforceable

This phase shifts the project from a standalone CLI into an enabling layer for other systems.

## Future Directions

`react-diagram-schema` will continue to evolve based on needs of downstream tools.

- Deeper integration with [react-diagram-visualizer](https://github.com/AmiraBasyouni/react-diagram-visualizer)
- Advanced TypeScript type extraction
- Enterprise-scale architecture auditing and policy enforcement

Community feedback will play a central role in shaping what becomes concrete.

## Candidate Features

This section collects actionable but optional ideas. Items here are _not commitments_. They exist to preserve thinking, invite contribution, and guide experimentation. Priority and inclusion depend on demonstrated developer demand.

**Possible extensions**:

- TypeScript type extraction (enums, unions, generics)
- Structural metadata (e.g. descendantDepth, isCollapsible)
- Grouping or namespacing by filepath

**Parser & CLI Enhancements**

- Performance optimization for large codebases (50+ components)
- Schema validation to detect missing or malformed entries
- Additional output flags (e.g. grouping by directory)

**Visualization-Oriented Metadata**

- Flags or hints to support collapsible subtrees
- Grouping strategies for large component graphs
- Metadata to improve readability without altering static analysis

These are ideas we're considering or exploring. If you'd like to help shape them through feedback or contribution, feel free to discuss ideas in the [Discussions](https://github.com/AmiraBasyouni/react-diagram-schema/discussions) or propose implementations through GitHub [Issues](https://github.com/AmiraBasyouni/react-diagram-schema/issues).
