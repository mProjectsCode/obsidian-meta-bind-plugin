---
fileSuggest: "[[Other/Example Notes/Example Note with Image.md|Example Note with Image]]"
suggest: option 2
---

### Simple Suggester
```meta-bind
INPUT[suggester(
option(option 1),
option(option 2),
option(option 3),
showcase
):suggest]
```

### Suggester with Dataview
Note, that this will error, if dataview is not enabled. 
```meta-bind
INPUT[suggester(optionQuery(#example-note), showcase):fileSuggest]
```