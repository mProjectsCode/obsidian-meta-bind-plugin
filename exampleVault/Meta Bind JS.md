---
select: c
---

```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const options = ['a', 'b', 'c'];

let declaration = mb.inputField.createInputFieldDeclaration();
declaration = mb.inputField.setType(declaration, 'select');
declaration = mb.inputField.setBindTargetMetadataField(declaration, 'select');

for (const option of options) {
	declaration = mb.inputField.addArgument(declaration, {name: 'option', value: option});
}

mb.createInputField(declaration, 'block', context.file.path, container, component);

```