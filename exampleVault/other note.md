---
tags: test
title: test
select: option a
date: 2023-05-19
time: 19:20
select: option d
multi-select:
  - option b
  - option c
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

