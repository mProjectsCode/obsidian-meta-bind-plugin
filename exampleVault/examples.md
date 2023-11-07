---
slider1: 4
suggest: test
toggle1: false
Domestic_tasks:
  - Lunch 🍲
Meditate: 100
Slept: 00:00
select: option c
toggle: false
nested:
  object: asd
inlineSelect: 0
こんにちは: hello
---

## In callouts
> quote
> `INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]`

> [!INFO]
> `INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]`

> [!INFO]
> ```meta-bind
> INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]
> ```

## Nested data
`INPUT[text:nested["object"]]`

## String Escaping

`INPUT[inlineSelect(option(0, 'don\'t do this'), option(1, 'do this \\')):inlineSelect]`

## Unicode

`INPUT[text:こんにちは]`

## Linking to a different note
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sit amet porttitor arcu. Quisque scelerisque dolor augue, et posuere nulla bibendum nec. Curabitur sed rhoncus nisl.

```meta-bind
INPUT[textArea(
title(text area),
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
INPUT[multiSelect(
title(A multi select input),
option(option a),
option(option b),
option(option c),
option(option d)
):other note#multi-select]
```

Lorem ipsum dolor sit amet, `INPUT[date():other note#date]` consectetur adipiscing elit. Pellentesque sit amet porttitor arcu. Quisque scelerisque dolor augue, et posuere nulla bibendum nec. `INPUT[date():other note#date]` Curabitur sed rhoncus nisl. Maecenas nisi justo, viverra vel tempus vel, hendrerit at metus. `INPUT[datePicker():other note#date]`  asdasd asdasdasd

## Templates
- `INPUT[][toggle:toggle1]` empty template
- `INPUT[nonExistantTemplate][toggle:toggle1]` unknown template
- `INPUT[toggleTemplate][]` 

## Error Messages
- `INPUT[text():meta bind/nonExistantFile#title]`
- `INPUT[slider(nonExistantArgument)]`
- `INPUT[slider]`
- `INPUT[inlineSelect(option(option a),option(option b),option(option c),option(option d):select]`
- `INPUT[inlineSelect(option(option a),option(option b),option(option c),option(option d)):select#]`
- `INPUT[inlineSelect(option(option a),option(option b),option(option c),option(option d)):select#:]`
- `INPUT[toggle:Bible Reading]`


Lorem ipsum dolor sit amet, `INPUT[text():meta bind/nonExistantFile#title]` consectetur adipiscing elit. Pellentesque sit amet porttitor arcu. Quisque scelerisque dolor augue, et posuere nulla bibendum nec. `INPUT[slider(nonExistantArgument)]` Curabitur sed rhoncus nisl. Maecenas nisi justo, viverra vel tempus vel, hendrerit at metus. `INPUT[select(option(option a),option(option b),option(option c),option(option d)):select]` asdasd asdasdasd

Code block error
```meta-bind
INPUT[slider(nonExistantArgument)]
```

`INPUT[inlineSelect(option(a), option(b), option(c)]`
