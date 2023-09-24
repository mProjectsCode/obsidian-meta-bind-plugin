---
select: b
---

## Creating an Input Field with JS Engine

JS Engine can be found [here](https://github.com/mProjectsCode/obsidian-js-engine-plugin).

**Code**
```js
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const options = ['a', 'b', 'c'];

// first, create an empty declaration
let declaration = mb.inputField.createInputFieldDeclaration();
// set the input field type
declaration = mb.inputField.setType(declaration, 'select');
// bind the input field to 'select'
declaration = mb.inputField.setBindTargetMetadataField(declaration, 'select');

for (const option of options) {
	// add all the options
	declaration = mb.inputField.addArgument(declaration, {name: 'option', value: [option]});
}

// create the input field in the container and pass in the component for life cycle management (container and component are globals exposed by js engine)
mb.createInputField(declaration, 'block', context.file.path, container, component);
```

**Resulting Input Field**
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const options = ['a', 'b', 'c'];

// first, create an empty declaration
let declaration = mb.inputField.createInputFieldDeclaration();
// set the input field type
declaration = mb.inputField.setType(declaration, 'select');
// bind the input field to 'select'
declaration = mb.inputField.setBindTargetMetadataField(declaration, 'select');

for (const option of options) {
	// add all the options
	declaration = mb.inputField.addArgument(declaration, {name: 'option', value: [option]});
}

declaration = mb.inputField.addArgument(declaration, {name: 'title', value: ['I was created using JS Engine and the Meta Bind API']});

// create the input field in the container and pass in the component for life cycle management (container and component are globals exposed by js engine)
mb.createInputField(declaration, 'block', context.file.path, container, component);
```