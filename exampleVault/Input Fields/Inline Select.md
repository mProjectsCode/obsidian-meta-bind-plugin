---
select: b
select2: 1
select3: 2 hours
select4:
---

```meta-bind
INPUT[inlineSelect(option(a), option(b), showcase):select]
```

```meta-bind
INPUT[inlineSelect(option(1, a), option(2, b), showcase):select2]
```

```meta-bind
INPUT[inlineSelect(option(1 hour, a), option(2 hours, b), showcase):select3]
```

```meta-bind
INPUT[inlineSelect(option(null, nothing), option(foo, something), showcase):select4]
```
