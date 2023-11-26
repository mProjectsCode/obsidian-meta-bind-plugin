Meta Bind is getting Buttons

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
style: default
label: Open File
action:
  type: open
  link: "[[View Fields/Other Note|Other Note]]"
```

```meta-bind-button
style: default
label: Open External Link
action:
  type: open
  link: https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/
```