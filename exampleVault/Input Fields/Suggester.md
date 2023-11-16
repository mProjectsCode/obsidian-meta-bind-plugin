---
fileSuggest: "[[Other/Example Notes/Example Note with Embeds.md|Example Note with Embeds]]"
fileSuggest2: Example Note with E
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

```meta-bind
INPUT[suggester(optionQuery(#example-note), useLinks(false), showcase):fileSuggest2]
```