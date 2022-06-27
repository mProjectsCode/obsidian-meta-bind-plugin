---
rating: 31
title: test title test test
completed: false
---

## List
- `INPUT[toggle:completed]` Toggle
- `INPUT[slider(addLabels):rating]` Slider 
- `INPUT[slider(addLabels, minValue(10), maxValue(60)):rating]` Slider with labels
- `INPUT[text:title]` Text
- `INPUT[text]` Text unbound
- `INPUT[text_area(class(meta-bind-full-width)):other note#title]` Different note text area

## Text block
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

A date input field
```meta-bind
INPUT[date():other note#date]
```

A time input field
```meta-bind
INPUT[time():other note#time]
```

Lorem ipsum dolor sit amet, `INPUT[date():other note#date]` consectetur adipiscing elit. Pellentesque sit amet porttitor arcu. Quisque scelerisque dolor augue, et posuere nulla bibendum nec. Curabitur sed rhoncus nisl. Maecenas nisi justo, viverra vel tempus vel, hendrerit at metus. 

## Error Messages
- `INPUT[text():meta bind/nonExistantFile#title]`  test test test

`INPUT[select(option(option a),option(option b),option(option c),option(option d)):other note#select]`