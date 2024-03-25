---
select: b
---

## Creating an Input Field with JS Engine

JS Engine can be found [here](https://github.com/mProjectsCode/obsidian-js-engine-plugin).

**Code**
```js
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const options = ['a', 'b', 'c'];

const arguments = options.map(x => ({
	name: 'option',
	value: [x],
}));

arguments.push({
	name: 'title',
	value: ['I was created using JS Engine and the Meta Bind API'],
});

const bindTarget = mb.parseBindTarget('select', context.file.path);

const mountable = mb.createInputFieldMountable(context.file.path, {
	renderChildType: 'block',
	declaration: {
		inputFieldType: 'select',
		bindTarget: bindTarget,
		arguments: arguments,
	},
});

mb.wrapInMDRC(mountable, container, component);
```

**Resulting Input Field**
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const options = ['a', 'b', 'c'];

const arguments = options.map(x => ({
	name: 'option',
	value: [x],
}));

arguments.push({
	name: 'title',
	value: ['I was created using JS Engine and the Meta Bind API'],
});

const bindTarget = mb.parseBindTarget('select', context.file.path);

const mountable = mb.createInputFieldMountable(context.file.path, {
	renderChildType: 'block',
	declaration: {
		inputFieldType: 'select',
		bindTarget: bindTarget,
		arguments: arguments,
	},
});

mb.wrapInMDRC(mountable, container, component);
```
