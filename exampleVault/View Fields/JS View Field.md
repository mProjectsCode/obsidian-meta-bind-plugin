---
number1: 123
number2: 43
result: "**5289** km"
---
`INPUT[number:number1]`
`INPUT[number:number2]`

```meta-bind-js-view
{number1} as n1
{number2} as n2
save to {result}
---
return engine.markdown.create(`**${context.bound.n1 * context.bound.n2}** km`);
```

[test](test\ 1.excalidraw)