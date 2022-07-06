---
rating: 31
title: test title test test
completed: false
toggle1: true
slider1: 7
slider2: 5
text1: Test text
text_area1: Test test
date1: 2022-05-28
select: option c
multi-select:
  - option a
  - option c
time1: 10:17
---

## Components
### Toggle
- `INPUT[toggle:toggle1]` Toggle

### Slider
- `INPUT[slider:slider1]` Slider
- `INPUT[slider(addLabels):slider1]` Slider with labels
- `INPUT[slider(addLabels, minValue(1), maxValue(10)):slider2]` Slider with custom range

### Text and text area
- `INPUT[text:text1]` Text
- `INPUT[text_area:text_area1]` Text Area

### Date
- `INPUT[date:date1]` Date

### Time
- `INPUT[time:time1]` Time

### Select
Select
```meta-bind
INPUT[select(
option(option a),
option(option b),
option(option c),
option(option d)
):select]
```

Select with title
```meta-bind
INPUT[select(
title(select with title),
option(option a),
option(option b),
option(option c),
option(option d)
):select]
```

### Multi-Select
Multi-Select
```meta-bind
INPUT[multi_select(
option(option a),
option(option b),
option(option c),
option(option d)
):multi-select]
```

Multi-Select with title
```meta-bind
INPUT[multi_select(
title(some title),
option(option a),
option(option b),
option(option c),
option(option d)
):multi-select]
```

## In callouts
> quote
> `INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]`

> [!INFO]
> `INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]` Slider

> [!INFO]
> `INPUT[slider(addLabels, minValue(1), maxValue(10)):slider1]`

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

Lorem ipsum dolor sit amet, `INPUT[date():other note#date]` consectetur adipiscing elit. Pellentesque sit amet porttitor arcu. Quisque scelerisque dolor augue, et posuere nulla bibendum nec. `INPUT[date():other note#date]` Curabitur sed rhoncus nisl. Maecenas nisi justo, viverra vel tempus vel, hendrerit at metus. `INPUT[date_picker:other note#date]`

## Error Messages
- `INPUT[text():meta bind/nonExistantFile#title]`
- `INPUT[slider(nonExistantArgument)]`
- `INPUT[select(option(option a),option(option b),option(option c),option(option d)):select]`
Code block error
```meta-bind
INPUT[slider(nonExistantArgument)]
```