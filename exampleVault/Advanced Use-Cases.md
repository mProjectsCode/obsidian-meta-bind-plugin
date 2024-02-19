---
list:
  - 1
  - 2
  - 3
index: 0
options:
  - "1"
  - "2"
  - "3"
selected: 1
---

## Changing the Bind Target

The `index` determines the element of the `list` array that the number input field binds to.

Index: `INPUT[inlineSelect(option(0), option(1), option(2)):index]`

```meta-bind-js-view
{index} as index
---
const str = `\`INPUT[number:list[${context.bound.index}]]\``;
return engine.markdown.create(str)
```

## Generating a list of Options from Front-matter

`INPUT[inlineList:options]`

```meta-bind-js-view
{options} as options
---
const options = context.bound.options.map(x => `option(${x})`).join(", ");
const str = `\`INPUT[inlineSelect(${options}):selected]\``;
return engine.markdown.create(str);
```