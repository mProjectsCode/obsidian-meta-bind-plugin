---
number1: 12
number2: 200
unit: km
distance: 12
computed: "**12**"
list:
  - 1
  - 2
  - 3
object:
  key: value
file: Example Note with Embeds
image: Other/Images/subfolder/img_frozen_branch.jpg
someInputValue: 1
someComputedValue: 2
images:
  - Other/Images/img_flower.webp
  - Other/Images/img_butterfly.webp
  - Other/Images/subfolder/img_frozen_branch.jpg
otherImages:
  - "[[Other/Images/img_flower.webp]]"
  - "[image](Other/Images/img_flower.webp)"
---

`INPUT[number:number1]`
`INPUT[number:number2]`
`INPUT[text:unit]`

Number one is: `VIEW[{number1}][math(class(mod-warning))]` units
Number two is: `VIEW[{number2}]` units

Combined: `VIEW[{number1} * {number2}]` cm equals `VIEW[{number2} * {number1} cm to {unit}]`

## Other Note

`INPUT[text:Other Note#text]`

`VIEW[{Other Note#text}]`

## Distance Example

Distance: `INPUT[number:distance]` km
Distance in freedom units: `VIEW[number({distance} km, miles)]` miles
Distance in freedom units: `VIEW[round(number({distance} km, miles), 2)]` miles

## Text Example

Text: `VIEW[**{distance}**][text]`
Markdown: `VIEW[**{distance}**][text(renderMarkdown)]`
Hidden: `VIEW[**{distance}**][text(hidden):computed]`
Display Computed: `VIEW[{computed}][text()]`
Display Computed as Markdown: `VIEW[{computed}][text(renderMarkdown)]`
Loop Error: `VIEW[**{computed}**][text():distance]`
Self Loop Error: `VIEW[**{computed}**][text():computed]`

## Links

`INPUT[suggester(optionQuery(#example-note), useLinks(false)):file]`
link with render markdown: `VIEW[\[\[{file}|link\]\]][text(renderMarkdown)]`
link with link view field: `VIEW[{file}][link]`

```meta-bind
INPUT[imageSuggester(optionQuery("Other/Images")):image]
```

`VIEW[{image}][image]`

```meta-bind
INPUT[imageListSuggester(optionQuery("Other/Images")):images]
```

`VIEW[{images}][image]`

`VIEW[{otherImages}][image]`

## Arrays and Objects

Plain Text:
`VIEW[{list}][text]`
`VIEW[{object}][text]`

Markdown:
`VIEW[**{list}**][text(renderMarkdown)]`
`VIEW[**{object}**][text(renderMarkdown)]`

Null:
`VIEW[{someUnknownValue}][text]`

Input: `INPUT[number:someInputValue]`
Computed Value: `VIEW[{someInputValue} * 2][math:someComputedValue]`