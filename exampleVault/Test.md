---
frequency: "[[high]]"
toggle: false
needs: Meta Bind JS
date: Saturday, July 8th 2023
text: asdasddas
---


`--INPUT[suggester(option([[low]]), option([[medium]]), option([[high]])):frequency]`

```_dataviewjs
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

```_dataviewjs
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


```meta-bind-parser-test
declarationValidationGraph
```

```meta-bind-parser-test
argumentsValidationGraph
```