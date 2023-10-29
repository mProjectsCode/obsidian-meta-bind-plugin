---
number1: 12
number2: 200
unit: km
distance: 12
computed: "**12**"
---

`INPUT[number:number1]`
`INPUT[number:number2]`
`INPUT[text:unit]`

Number one is: `VIEW[{number1}]` units
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
