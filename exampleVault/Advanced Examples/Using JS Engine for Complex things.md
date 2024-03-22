---
text: abcasdas
locked: true
from_year: a22
to_year: "23"
---

Locked: `INPUT[toggle:locked]`
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
// a component for lifecycle management of the fields created in our render function
const comp = new obsidian.Component(component);

// create a bind target to the property that we care about
const bindTarget = mb.parseBindTarget('locked', context.file.path);

// the render function, it takes the locked value as the argument
function render(value) {
	// first we unload the component to unload the content from the previous rerender
	comp.unload();
	// then we load the component again for this rerender.
	comp.load();
	// then we empty the element we render to to remove content created in the previous rerender
	container.empty();

	// next we create the field based on the locked value
	let field;
	if (value) {
		field = mb.createInlineFieldFromString("VIEW[{text}][text]", context.file.path, undefined);
	} else {
		field = mb.createInlineFieldFromString("INPUT[text:text]", context.file.path, undefined);
	}

	// and finally we render that field
	mb.wrapInMDRC(field, container, comp);
}

// we create a reactive component from the render function and the initial value will be the value of the bind target
const reactive = engine.reactive(render, mb.getMetadata(bindTarget));

// then we subscribe to the metadata that the bind target points to and rerender the reactive component everythime the bind target value changes
const subscription = mb.subscribeToMetadata(
	bindTarget,
	component,
	(value) => reactive.refresh(value)
);

return reactive;
```

```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const bindTarget = mb.parseBindTarget('text', context.file.path);

function onUpdate(value) {
	return value.toString();
}

const reactive = engine.reactive(onUpdate, mb.getMetadata(bindTarget));

const subscription = mb.subscribeToMetadata(
	bindTarget,
	component,
	(value) => reactive.refresh(value)
);

return reactive;
```

`INPUT[text:from_year]`
`INPUT[text:to_year]`

```js-engine
// Grab metabind API and extract metadata fields
const mb     = engine.getPlugin('obsidian-meta-bind-plugin').api;
const mbFrom = mb.parseBindTarget('from_year', context.file.path);
const mbTo   = mb.parseBindTarget('to_year', context.file.path);

return mb.reactiveMetadata([mbFrom, mbTo], component, (from, to) => {
	return [from, to]
})
```