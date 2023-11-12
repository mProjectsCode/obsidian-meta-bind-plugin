---
list:
  - apple
  - banana
  - berries
  - https://github.com/
list2:
  - "[[Other/Example Notes/Example Note with Image.md|Example Note with Image]]"
  - "[[Other/Example Notes/Example Note with Callouts.md|Example Note with Callouts]]"
list3:
  - Example Note with Image
  - Example Note with Callouts
  - Example Note with Embeds
list4:
  - Example Note with Callouts
  - Example Note with Embeds
  - Example Note with Embeds
list5:
  - this is an element
---


```meta-bind
INPUT[list(showcase):list]
```

`VIEW[{list}][link]`

```meta-bind
INPUT[listSuggester(optionQuery(#example-note), showcase):list2]
```

`VIEW[{list2}][link]`

```meta-bind
INPUT[listSuggester(optionQuery(#example-note), useLinks(false), showcase):list3]
```

`VIEW[{list3}][link]`

```meta-bind
INPUT[inlineListSuggester(optionQuery(#example-note), option(something, other), useLinks(false), showcase):list4]
```


Some text: `INPUT[inlineListSuggester(optionQuery(#example-note), option(something, other), useLinks(false)):list4]` some more text


Some text: `INPUT[inlineList:list5]` some more text