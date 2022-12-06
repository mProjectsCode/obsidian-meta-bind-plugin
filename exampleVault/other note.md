---
tags: test
title: "test test test "
select: option b
date: Tuesday, June 21st 2022
time: 19:20
multi-select:
  - option a
  - option b
---

## This is another note
This note is to test syncing to another note.


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