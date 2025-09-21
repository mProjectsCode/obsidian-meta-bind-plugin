# Making Dynamic Dataview Queries via Meta Bind

A practical example showing how to dynamically populate MetaBind input fields using Dataview queries. This addresses the common use case of wanting to filter suggester options based on note properties in ways that aren't possible with normal optionQuery. This approach lets you filter by any frontmatter property, not just tags, to create more targeted suggestion lists. 

Use Case: You're editing a character note and want to populate a "friends" field with only other character notes, excluding non-character content like locations, objects, etc.

```js-engine
const dv = engine.getPlugin('dataview').api;

const filterProperty = "categories";   // frontmatter property to filter on
const filterValue    = "character";    // value to match - only character notes
const fieldName = "friends"; 		   // the actual field we're populating

// Query: WHERE categories contains "character"
// This finds all notes matching the filter criteria.
const pages = dv.pages()
  .where(p => p[filterProperty] && p[filterProperty].includes(filterValue));

// Turn into Meta Bind options
const options = pages.map(p => `option(${p.file.name})`).join(", ");

// Build the Meta Bind input string
const inputField = `\`INPUT[listSuggester(${options}):${fieldName}]\``;

return engine.markdown.create(inputField);
```
