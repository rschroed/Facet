# Generate Prompt

Create a paste-ready prompt for an external agent tool.

The prompt must:

- state that Facets prepared the prompt but does not have direct Figma access
- instruct the external agent to use its own Figma MCP tools if available
- include the brief, selected direction, constraints, and tone
- define a scoped sequence of actions
- end by asking the agent to report strengths, weak spots, and the next refinement prompt

Do not write one giant prompt that attempts every design iteration at once.
