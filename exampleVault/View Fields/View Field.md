---
number1: 13
number2: 200
unit: km
distance: 5
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

## Distance example

Distance: `INPUT[number:distance]` km
Distance in freedom units: `VIEW[number({distance} km, miles)]` miles
Distance in freedom units: `VIEW[round(number({distance} km, miles), 2)]` miles