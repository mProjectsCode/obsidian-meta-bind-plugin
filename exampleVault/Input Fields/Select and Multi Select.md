---
select: 1
select3: 2
multiSelect:
  - option 1
  - option 3
multiSelect2:
  - option 1
  - option 3
multiSelect3:
  - 1
  - 
  - false
select2: 
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