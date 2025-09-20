# Making Dynamic Dataview Queries via Meta Bind
A practical example showing how to dynamically populate MetaBind input fields using Dataview queries. This addresses the common use case of wanting to filter suggester options based on note properties, in ways that isn't possible with normal optionQuery. Will require adjustment based on your particular use case, but it's a place to start.

The code block here is the equivalent of making the query `WHERE {property} = "{value}"` 

```js-engine
const dv = engine.getPlugin('dataview').api;

const property = "categories";   // frontmatter property to filter on
const value    = "character";    // value to match
// Equivalent to the Dataview query WHERE categories = "character"

// Query notes where the property contains the value
const pages = dv.pages()
  .where(p => p[property] && p[property].includes(value));

// Turn into Meta Bind options
const options = pages.map(p => `option(${p.file.name})`).join(", ");

// Build the Meta Bind input string
const inputField = `\`INPUT[listSuggester(${options}):${value}]\``;

return engine.markdown.create(inputField);
```
