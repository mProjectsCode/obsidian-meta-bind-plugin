---
fileSuggest: "[[Other/Example Notes/Example Note with Embeds.md|Example Note with Embeds]]"
suggest: option 1
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