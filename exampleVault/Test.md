---
frequency: "[[high]]"
toggle: false
needs: Text
date: Saturday, July 8th 2023
text: asdasddas
---


`--INPUT[suggester(option([[low]]), option([[medium]]), option([[high]])):frequency]`

```dataviewjs
const setFilter = "" ;
let filter = "Need | "
const pages = await dv.pages()
let list = []

for (let items of pages) {
	list.push('option(' + items.file.name + ')')
}

// This is the Mermaid configuration.
const codeblock = "INPUT[suggester(";
const backticks = "`";

console.log(`${filter}${backticks}${codeblock}${list}):needs]${backticks}`);

await dv.paragraph(`${filter}${backticks}${codeblock}${list}):needs]${backticks}`);
```

```dataviewjs
const setFilter = "" ;
let filter = "Need | "
const pages = await dv.pages()
let list = []

for (let items of pages) {
	list.push('option(' + items.file.name + ')')
}

// This is the Mermaid configuration.
const codeblock = "INPUT[text:text]";
const backticks = "`";

console.log(`${filter}${backticks}${codeblock}${backticks}`);

await dv.paragraph(`${filter}${backticks}${codeblock}${backticks}`);
```
