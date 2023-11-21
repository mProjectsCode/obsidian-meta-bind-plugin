---
activities:
  - {}
---

```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const bindTarget = mb.createBindTarget('activities');
const tableHead = ['From', 'To', 'Activity', 'Status'];
const columns = [
	mb.inputField.createInputFieldDeclarationFromString('INPUT[time:^.from]'),
	mb.inputField.createInputFieldDeclarationFromString('INPUT[time:^.to]'),
	mb.inputField.createInputFieldDeclarationFromString('INPUT[inlineSelect(option(youtube), option(sudying), option(linch)):^.activity]'),
	mb.inputField.createInputFieldDeclarationFromString('INPUT[inlineSelect(option(-, unproductive), option(0, normal), option(+, productive)):^.status]')
];


mb.createTable(container, context.file.path, component, bindTarget, tableHead, columns);
```