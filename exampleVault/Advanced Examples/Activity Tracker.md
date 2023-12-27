---
activities:
  - activity: sudying
    status: 0
    from: 02:02
    to: 03:02
---

```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const bindTarget = mb.createBindTarget('activities', context.file.path);
const tableHead = ['From', 'To', 'Activity', 'Status'];
const columns = [
	mb.inputField.createInputFieldDeclarationFromString('INPUT[time:scope^from]'),
	mb.inputField.createInputFieldDeclarationFromString('INPUT[time:scope^to]'),
	mb.inputField.createInputFieldDeclarationFromString('INPUT[inlineSelect(option(youtube), option(sudying), option(linch)):scope^activity]'),
	mb.inputField.createInputFieldDeclarationFromString('INPUT[inlineSelect(option(-, unproductive), option(0, normal), option(+, productive)):scope^status]')
];


mb.createTable(container, context.file.path, component, bindTarget, tableHead, columns);
```