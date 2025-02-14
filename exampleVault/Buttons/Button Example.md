---
count: 10
someList:
  - 1708945050652
  - 1709918700548
count2: 0
---
Meta Bind is getting Buttons

text `BUTTON[docs-button]` text
text `BUTTON[docs-button, docs, open-button]` text

```meta-bind
BUTTON[docs-button]
```

With a custom class and a CSS snippet we can change the button to be green.

```meta-bind-button
style: primary
label: Open Meta Bind Playground
class: green-button
action:
  type: command
  command: obsidian-meta-bind-plugin:open-playground
```

Custom templater commands

```meta-bind-button
style: default
label: "Run a templater file"
actions:
  - type: runTemplaterFile
    templateFile: "templates/templater/Say Hello Command.md"
```

And custom JS buttons as well

```meta-bind-button
style: default
label: Run Custom JS
action:
  type: js
  file: testJsFile.js
  args: 
    greeting: "Meta Bind User"
```

And open internal and external links

```meta-bind-button
style: primary
id: open-button
hidden: true
label: Open File
action:
  type: open
  link: "[[View Fields/Other Note|Other Note]]"
```

```meta-bind-button
style: primary
id: open-tab-button
hidden: true
label: Open File new Tab
action:
  type: open
  newTab: true
  link: "[[View Fields/Other Note|Other Note]]"
```

```meta-bind-button
style: default
id: docs-button
hidden: true
label: Open External Link
action:
  type: open
  link: https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/
```

text `BUTTON[docs-button, open-button, open-tab-button]` text

And switch between light and dark mode

```meta-bind-button
label: Switch to Light Mode
hidden: false
id: ""
style: destructive
actions:
  - type: command
    command: theme:use-light
```

```meta-bind-button
label: Switch to Dark Mode
hidden: false
id: ""
style: primary
actions:
  - type: command
    command: theme:use-dark

```

And multiple things

```meta-bind-button
label: This is a button
class: test-class
hidden: false
id: ""
style: primary
actions:
  - type: command
    command: workspace:new-tab
  - type: js
    file: "testJsFile.js"

```


## Button Types

```meta-bind-button
label: Input
hidden: false
tooltip: "Open command palette and then search for 'help'"
id: ""
style: default
actions:
  - type: command
    command: command-palette:open
  - type: input
    str: help

```

```meta-bind-button
label: Templater
hidden: false
id: ""
style: default
actions:
  - type: templaterCreateNote
    templateFile: "templates/templater/Templater Template.md"
    fileName: Button Templater Test

```

```meta-bind-button
label: Sleep
hidden: false
id: ""
style: default
actions:
  - type: command
    command: command-palette:open
  - type: sleep
    ms: 1000
  - type: input
    str: help

```

```meta-bind-button
label: Show PF2e Examples with Delay
hidden: false
id: ""
style: default
actions:
  - type: command
    command: switcher:open
  - type: sleep
    ms: 500
  - type: input
    str: PF2e

```

```meta-bind-button
label: Test
hidden: false
id: ""
style: default
actions:
  - type: sleep
    ms: 1000
  - type: command
    command: obsidian-meta-bind-plugin:open-help

```

```meta-bind-button
label: Create new Note
hidden: false
class: ""
tooltip: ""
id: ""
style: default
actions:
  - type: createNote
    folderPath: templates
    fileName: asdasd
    openNote: false
    openIfAlreadyExists: true

```

```meta-bind-button
label: Inline Js
icon: "file-code"
hidden: false
class: ""
tooltip: ""
id: ""
style: default
actions:
  - type: inlineJS
    code: console.log("Hello world")

```


### Modifying Front-matter

```meta-bind-button
label: "+1"
hidden: true
id: "count-increment"
style: default
actions:
  - type: updateMetadata
    bindTarget: count
    evaluate: true
    value: Math.min(10, x + 1)

```

```meta-bind-button
label: "-1"
hidden: true
id: "count-decrement"
style: default
actions:
  - type: updateMetadata
    bindTarget: count
    evaluate: true
    value: Math.max(0, x - 1)

```

```meta-bind-button
label: "Reset"
hidden: true
id: "count-reset"
style: default
actions:
  - type: updateMetadata
    bindTarget: count
    evaluate: false
    value: 0

```

Count: `BUTTON[count-decrement, count-reset, count-increment]` `VIEW[{count}]`

```meta-bind-button
label: "Add count to count2"
hidden: false
style: default
actions:
  - type: updateMetadata
    bindTarget: count2
    evaluate: true
    value: "x + getMetadata('count')"

```

Count2: `VIEW[{count2}]`

```meta-bind-button
label: Add Current Time to List
hidden: false
class: ""
tooltip: ""
id: ""
style: primary
actions:
  - type: updateMetadata
    bindTarget: someList
    evaluate: true
    value: "x == null ? [Date.now()] : [...x, Date.now()]"

```

## Button Templates

`BUTTON[test-id]`

## Invalid Buttons

```meta-bind-button
label: Test
hidden: false
id: ""
style: default
actions:
  - type: sleep
  - type: command
    command: obsidian-meta-bind-plugin:open-help

```

```meta-bind-button
label: Test
hidden: false
id: ""
style: default
actions:
  - type: aaaa
  - type: command
    command: obsidian-meta-bind-plugin:open-help

```

```meta-bind-button
label: Test
hidden: asdasd
id: ""
style: default
actions:
  - type: command
    command: obsidian-meta-bind-plugin:open-help

```

```meta-bind-button
label: This is a button
icon: ""
hidden: false
class: ""
tooltip: ""
id: test-id
style: default
actions: []

```
