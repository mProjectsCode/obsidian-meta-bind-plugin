---
STR: 8
DEX: 16
CON: 11
INT: 12
WIS: 14
CHR: 11
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
