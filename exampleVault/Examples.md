---
slider1: 5
suggest: test
toggle1: false
Domestic_tasks:
  - Lunch 🍲
Meditate: 100
Slept: 00:00
select: option d
toggle: false
inlineSelect: 1
こんにちは: hello
nested:
  object: test
number1: 2
number2: 10
time: 
---

## Fields Work Everywhere

Input and view fields work in the top level and in 

> `INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]`

> [!info]
> `INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]`

> [!INFO]
> ```meta-bind
> INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]
> ```

## Nested data

Input fields work with nested front-matter.

`INPUT[text(showcase):nested["object"]]`

`INPUT[inlineSelect(option(0, 'don\'t do this'), option(1, 'do this \\'), showcase):inlineSelect]`

## String Escaping

Certain characters need escaping.

```meta-bind
INPUT[inlineSelect(option(0, 'don\'t do this'), option(1, 'do this \\'), showcase):inlineSelect]
```

## Unicode

Meta Bind supports Unicode characters.

```meta-bind
INPUT[text:こんにちは]
```

## Binding to Another Note

Meta Bind supports binding to front-matter of a different note.

Text area to a different note.
```meta-bind
INPUT[textArea(
title(text area),
class(meta-bind-full-width),
class(meta-bind-high)
):other note#title]
```

A select to a different note.
```meta-bind
INPUT[select(
option(option a),
option(option b),
option(option c),
option(option d)
):other note#select]
```

A multi select to a different note.
```meta-bind
INPUT[multiSelect(
title(A multi select input),
option(option a),
option(option b),
option(option c),
option(option d)
):other note#multi-select]
```

## Inline Input Fields

Inline input fields should not cause line breaks.

Lorem ipsum dolor sit amet, `INPUT[date():other note#date]` consectetur adipiscing elit. Pellentesque sit amet porttitor arcu. Quisque scelerisque dolor augue, et posuere nulla bibendum nec. `INPUT[date():other note#date]` Curabitur sed rhoncus nisl. Maecenas nisi justo, viverra vel tempus vel, hendrerit at metus. `INPUT[datePicker():other note#date]` asdasd asdasdasd


| test                                  | table                                       |     |
| ------------------------------------- | ------------------------------------------- | --- |
| `INPUT[datePicker():other note#date]` | `VIEW[{other note#date}][text]`             |     |
| `INPUT[number:number1]`               | `VIEW[{slider1} * {number1}][math:number2]` |     |

## Templates

For input fields, templates can be set in the plugin settings

- `INPUT[][toggle:toggle1]` empty template
- `INPUT[nonExistantTemplate][toggle:toggle1]` unknown template
- `INPUT[toggleTemplate][]`

## Error Messages

There are a lot of different error messages and they are clickable

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
