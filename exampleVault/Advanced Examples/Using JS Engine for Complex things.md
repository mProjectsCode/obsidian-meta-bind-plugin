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
	comp.unload()
	comp.load()
	container.empty();
	if (signal.get()) {
		mb.createViewFieldFromString("VIEW[{text}][text]", "inline", context.file.path, container, comp);
	} else {
		mb.createInputFieldFromString("INPUT[text:text]", "inline", context.file.path, container, comp);
	}
	
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