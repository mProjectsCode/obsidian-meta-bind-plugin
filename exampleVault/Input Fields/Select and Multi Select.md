---
select: "1"
multiSelect:
  - option 1
  - option 3
---

### Select
```meta-bind
INPUT[select(
option(1, option 1), 
option(2, option 2), 
option(3, option 3), 
showcase
):select]
```

### Multi Select
```meta-bind
INPUT[multi_select(
option(option 1), 
option(option 2), 
option(option 3), 
showcase
):multiSelect]

```