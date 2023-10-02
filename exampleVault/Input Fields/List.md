---
list:
  - apple
  - banana
  - berries
list2:
  - "[[Other/Example Notes/Example Note with Image.md|Example Note with Image]]"
  - something
  - "[[Other/Example Notes/Example Note with Callouts.md|Example Note with Callouts]]"
list3:
  - Example Note with Image
  - Example Note with Callouts
  - something
---


```meta-bind
INPUT[list(showcase):list]
```

```meta-bind
INPUT[listSuggester(optionQuery(#example-note), option(something, other), showcase):list2]
```

```meta-bind
INPUT[listSuggester(optionQuery(#example-note), option(something, other), useLinks(false), showcase):list3]
```