---
activities:
  - from: 03:00
    to: 04:17
    activity: sudying
    status: 0
  - from: 00:03
    activity: youtube
    to: 03:00
    status: +
---

```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const tableOptions = {
	bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['activities']),
	tableHead: ['From', 'To', 'Activity', 'Status'],
	columns: [
		'INPUT[time:scope^from]',
		'INPUT[time:scope^to]',
		'INPUT[inlineSelect(option(youtube), option(sudying), option(linch)):scope^activity]',
		'INPUT[inlineSelect(option(-, unproductive), option(0, normal), option(+, productive)):scope^status]',
	],
};

const mountable = mb.createTableMountable(context.file.path, tableOptions);

mb.wrapInMDRC(mountable, container, component);
```