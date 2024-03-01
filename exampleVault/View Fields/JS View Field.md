---
number1: 100
number2: 43
result: "**4300** km"
n1clone: 100
cssclasses:
  - aa
  - test-class
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

```meta-bind-js-view
{number1} as n1
save to {n1clone}
---
return context.bound.n1;
```

You can also dynamically add CSS classes to your note this way.

```meta-bind-js-view
{number1} as n1
save to {cssclasses}
---
const CLASS = 'test-class';

const addClass = context.bound.n1 >= 100;
let css = new Set(context.metadata.frontmatter.cssclasses ?? []);

if (addClass) {
    css.add(CLASS);
} else {
    css.delete(CLASS);
}

return [...css.values()];
```