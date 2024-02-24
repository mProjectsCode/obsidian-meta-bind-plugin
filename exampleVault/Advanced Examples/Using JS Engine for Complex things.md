---
text: aasdasd
locked: false
---

Locked: `INPUT[toggle:locked]`
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const signal = mb.createSignal(undefined);

component.register(mb.listenToMetadata(signal, context.file.path, ['locked']));

const comp = new obsidian.Component(component);

function render() {
	comp.unload();
	comp.load();
	container.empty();
	let field;
	if (signal.get()) {
		field = mb.createInlineFieldFromString("VIEW[{text}][text]", context.file.path, undefined);
	} else {
		field = mb.createInlineFieldFromString("INPUT[text:text]", context.file.path, undefined);
	}
	mb.wrapInMDRC(field, container, comp);
}

const reactive = engine.reactive(render);
signal.registerListener({
	callback: () => reactive.refresh(),
});

return reactive;
```

```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const signal = mb.createSignal(undefined)
component.register(mb.listenToMetadata(signal, context.file.path, ['text']))

function onUpdate(value) {
	return value.toString()
}

const reactive = engine.reactive(onUpdate, signal.get())
signal.registerListener({
	callback: (v) => reactive.refresh(v),
})

return reactive;
```