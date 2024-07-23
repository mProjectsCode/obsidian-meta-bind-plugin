---
tags: test
title: test te
select: option a
date: 2023-09-22
time: 19:20
multi-select:
  - option a
  - option b
text: this is some text
---

## This is another note
This note is to test syncing to another note.

### Select
Select
```meta-bind
INPUT[
	select(
		option(option a),
		option(option b),
		option(option c),
		option(option d)
	):select
]
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

