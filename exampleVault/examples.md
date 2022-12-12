---
slider1: 1
---

---
slider1: 7
nested:
  object: dfgdf
suggest: test
toggle1: false
---

## In callouts
> quote
> `INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]`

> [!INFO]
> `INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]` Slider

> [!INFO]
> `INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]`

## Nested data
`INPUT[text:nested["object"]]`

---

## Linking to a different note
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sit amet porttitor arcu. Quisque scelerisque dolor augue, et posuere nulla bibendum nec. Curabitur sed rhoncus nisl.

```meta-bind
INPUT[text_area(
class(meta-bind-full-width),
class(meta-bind-high)
):other note#title]
```

A select to a different note
```meta-bind
INPUT[select(
option(option a),
option(option b),
option(option c),
option(option d)
):other note#select]
```

A multi select to a different note
```meta-bind
INPUT[multi_select(
title(A multi select input),
option(option a),
option(option b),
option(option c),
option(option d)
):other note#multi-select]
```

Lorem ipsum dolor sit amet, `INPUT[date():other note#date]` consectetur adipiscing elit. Pellentesque sit amet porttitor arcu. Quisque scelerisque dolor augue, et posuere nulla bibendum nec. `INPUT[date():other note#date]` Curabitur sed rhoncus nisl. Maecenas nisi justo, viverra vel tempus vel, hendrerit at metus. `INPUT[date_picker():other note#date]`  asdasd asdasdasd

## Templates
- unknown tempalate
	- `INPUT[][toggle:toggle1]`
	- `INPUT[nonExistantTemplate][toggle:toggle1]`
- `INPUT[toggleTemplate][:toggle1]`

## Error Messages
- `INPUT[text():meta bind/nonExistantFile#title]`
- `INPUT[slider(nonExistantArgument)]`
- `INPUT[select(option(option a),option(option b),option(option c),option(option d)):select]`

Code block error
```meta-bind
INPUT[slider(nonExistantArgument)]
```