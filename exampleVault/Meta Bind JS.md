---
select: c
---

test
```meta-bind-js
const declaration = mb.createDeclaration(
	'select',
	[
		{type: 'option', value: 'a'},
		{type: 'option', value: 'c'},
	]
);

mb.bindDeclaration(declaration, 'select');

const inputField = mb.createInputField(declaration, undefined, 'block');

inputField.readSignal.registerListener({callback: (value) => console.log(`test ${value}`)})

ctx.addChild(inputField);
```

```meta-bind-js
const declaration = mb.createDeclaration(
	'select',
	[
		{type: 'option', value: 'd'},
		{type: 'option', value: 'e'},
	]
);

mb.bindDeclaration(declaration, 'select');

const inputField = mb.createInputField(declaration, undefined, 'block');

ctx.addChild(inputField);
```

```js
const declaration = mb.createDeclaration(
	'select',
	[
		{type: 'option', value: 'a'},
		{type: 'option', value: 'c'},
	],
	'select'
);

0000

const inputField = mb.createInputField(declaration, undefined, 'block');

ctx.addChild(inputField);
```

test