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
  jsFile: testJsFile.js
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

##### 1. The
##### 2. The 
##### 3. Refusal