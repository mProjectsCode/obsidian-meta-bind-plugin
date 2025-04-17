---
STR: 8
DEX: 16
CON: 11
INT: 12
WIS: 14
CHR: 11
PROF_mod: 5
proficiency:
  acrobatics: 2
  arcana: 1
  deception: 0.5
---

This example calculates a DnD character's ability modifiers from the ability scores and displays it all in a list.

The modifiers are stored in `memory` and not in the frontmatter. This reduces clutter but requires some hidden fields that calculate the values while the fields in the list just format the value to always contain a `+/-` sign.


## Character ability scores

```meta-bind
VIEW[ floor(({STR} - 10) / 2) ][math(hidden):memory^STR_mod]
```
```meta-bind
VIEW[ floor(({DEX} - 10) / 2) ][math(hidden):memory^DEX_mod]
```
```meta-bind
VIEW[ floor(({CON} - 10) / 2) ][math(hidden):memory^CON_mod]
```
```meta-bind
VIEW[ floor(({INT} - 10) / 2) ][math(hidden):memory^INT_mod]
```
```meta-bind
VIEW[ floor(({WIS} - 10) / 2) ][math(hidden):memory^WIS_mod]
```
```meta-bind
VIEW[ floor(({CHR} - 10) / 2) ][math(hidden):memory^CHR_mod]
```

- STR: `VIEW[**{STR}**][text(renderMarkdown)]` (`VIEW[ concat(isPositive({memory^STR_mod}) ? '+' : '', string({memory^STR_mod})) ][math]`)
- DEX: `VIEW[**{DEX}**][text(renderMarkdown)]` (`VIEW[ concat(isPositive({memory^DEX_mod}) ? '+' : '', string({memory^DEX_mod})) ][math]`)
- CON: `VIEW[**{CON}**][text(renderMarkdown)]` (`VIEW[ concat(isPositive({memory^CON_mod}) ? '+' : '', string({memory^CON_mod})) ][math]`)
- INT: `VIEW[**{INT}**][text(renderMarkdown)]` (`VIEW[ concat(isPositive({memory^INT_mod}) ? '+' : '', string({memory^INT_mod})) ][math]`)
- WIS: `VIEW[**{WIS}**][text(renderMarkdown)]` (`VIEW[ concat(isPositive({memory^WIS_mod}) ? '+' : '', string({memory^WIS_mod})) ][math]`)
- CHR: `VIEW[**{CHR}**][text(renderMarkdown)]` (`VIEW[ concat(isPositive({memory^CHR_mod}) ? '+' : '', string({memory^CHR_mod})) ][math]`)

## Skill modifiers

If we want to calculate the skill modifiers for a character, while also taking into account it's proficiency, we can leverage the `inlineSelect` Input to map the proficiency types to numerical values while still having a nice, editable interface.
We can additionally style the input depending on the currently selected value, to get helpful visual indicators.

#### Here you can see an example of how it could work

First we need to set the proficiency modifier: `INPUT[number:PROF_mod]`

`INPUT[inlineSelect(option(0,not proficienct), option(0.5,half proficienct), option(1,proficient), option(2,experties), defaultValue(0), class(dnd5e-skill-prof)):proficiency.acrobatics]` Acrobatics (DEX) `VIEW[floor({proficiency.acrobatics}*{PROF_mod})+{memory^DEX_mod}]`
`INPUT[inlineSelect(option(0,not proficienct), option(0.5,half proficienct), option(1,proficient), option(2,experties), defaultValue(0), class(dnd5e-skill-prof)):proficiency.arcana]` Arcana (INT) `VIEW[floor({proficiency.arcana}*{PROF_mod})+{memory^INT_mod}]`
`INPUT[inlineSelect(option(0,not proficienct), option(0.5,half proficienct), option(1,proficient), option(2,experties), defaultValue(0), class(dnd5e-skill-prof)):proficiency.deception]` Deception (CHR) `VIEW[floor({proficiency.deception}*{PROF_mod})+{memory^CHR_mod}]`
`INPUT[inlineSelect(option(0,not proficienct), option(0.5,half proficienct), option(1,proficient), option(2,experties), defaultValue(0), class(dnd5e-skill-prof)):proficiency.perception]` Perception (WIS) `VIEW[floor({proficiency.perception}*{PROF_mod})+{memory^WIS_mod}]`
