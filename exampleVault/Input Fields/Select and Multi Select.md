---
select: 2
multiSelect:
  - option 1
  - option 3
select2: null
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

```meta-bind
INPUT[select(
option(1, option 1), 
option(false, option 2), 
option(null, option 3), 
showcase
):select2]
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