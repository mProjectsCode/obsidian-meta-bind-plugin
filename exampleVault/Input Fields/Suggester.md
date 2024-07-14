---
suggest: option 2
fileSuggest: "[[Other/Example Notes/Example Note with Embeds.md|Example Note with Embeds]]"
fileSuggest2: "[[Example Note with Embeds]]"
fileSuggest3: Example Note with Embeds
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

```meta-bind
INPUT[suggester(
option(option 1),
option(option 2),
option(option 3),
allowOther,
showcase
):suggest]
```

### Suggester with Dataview

Note, that this will error, if dataview is not enabled. 

`INPUT[suggester(optionQuery(#example-note)):fileSuggest]`

```meta-bind
INPUT[suggester(optionQuery(#example-note), showcase):fileSuggest]
```

```meta-bind
INPUT[suggester(optionQuery(#example-note), useLinks(partial), showcase):fileSuggest2]
```

```meta-bind
INPUT[suggester(optionQuery(#example-note), useLinks(false), showcase):fileSuggest3]
```