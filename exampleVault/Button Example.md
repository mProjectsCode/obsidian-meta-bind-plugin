Meta Bind is getting Buttons

text `BUTTON[docs-button]` text
text `BUTTON[docs-button, docs, open-button]` text

```meta-bind-button
style: primary
label: Open Meta Bind FAQ
action:
  type: command
  command: obsidian-meta-bind-plugin:mb-open-faq
```

And custom JS buttons as well

```meta-bind-button
style: default
label: Run Custom JS
action:
  type: js
  file: testJsFile.js
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
style: default
id: docs-button
hidden: true
label: Open External Link
action:
  type: open
  link: https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/
```

text `BUTTON[docs-button, open-button]` text

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

```meta-bind-button
label: This is a button
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
