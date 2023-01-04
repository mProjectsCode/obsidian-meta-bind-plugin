---
select: a
---

test
```meta-bind-js
const declaration = mb.createDeclaration(
	'select',
	[
		{type: 'option', value: 'a'},
		{type: 'option', value: 'c'},
	],
	'select'
);

const inputField = mb.createInputField(declaration, undefined, 'block');

ctx.addChild(inputField);
```
test