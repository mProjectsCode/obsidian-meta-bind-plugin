---
fileSuggest: "[[Other/Example Notes/Example Note with Image.md|Example Note with Image]]"
suggest: option 3
---

### Simple Suggester
```meta-bind
INPUT[suggester(
suggestOption(option 1),
suggestOption(option 2),
suggestOption(option 3),
showcase
):suggest]
```

### Suggester with Dataview
Note, that this will error, if dataview is not enabled. 
```meta-bind
INPUT[suggester(suggestOptionQuery(#example-note), showcase):fileSuggest]
```