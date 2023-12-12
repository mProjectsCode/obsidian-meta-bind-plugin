---
text: aaa
locked: false
---


Locked: `INPUT[toggle:locked]`
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const signal = mb.createSignal(undefined)
component.register(mb.listenToMetadata(signal, context.file.path, ['locked']))

function render() {
	container.empty();
	if (signal.get()) {
		mb.createViewFieldFromString("VIEW[{text}][text]", "INLINE", context.file.path, container, component);
	} else {
		mb.createInputFieldFromString("INPUT[text:text]", "INLINE", context.file.path, container, component);
	}
	
}

const reactive = engine.reactive(render)
signal.registerListener({
	callback: () => reactive.refresh(),
})

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