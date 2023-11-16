---
select: 1
select2: false
select3: 2
multiSelect:
  - option 1
  - option 3
multiSelect2:
  - option 3
  - option 1
multiSelect3:
  - 
  - false
  - 1
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

```meta-bind
INPUT[select(
option(1, option 1), 
option(2, option 2), 
option(3, option 3), 
option(3, option 3), 
option(2, option 2), 
showcase
):select3]
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

```meta-bind
INPUT[multiSelect(
option(option 1), 
option(option 2), 
option(option 3), 
option(option 3), 
option(option 2), 
showcase
):multiSelect2]
```

```meta-bind
INPUT[multiSelect(
option(1, option 1), 
option(false, option 2), 
option(null, option 3), 
showcase
):multiSelect3]
```