---
number1: 123
number2: 5
---
`INPUT[number:number1]`
`INPUT[number:number2]`

```meta-bind-js-view
{number1} as n1
{number2} as n2
---
return engine.markdown.create(`**${context.bound.n1 * context.bound.n2}** km`);
```

