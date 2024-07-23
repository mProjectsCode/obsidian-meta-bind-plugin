---
progress1: -6
progress2: 0.7
progress3: 2
progress4: 2.6
---

```meta-bind
INPUT[progressBar(showcase, minValue(-10), maxValue(3)):progress1]
```

```meta-bind
INPUT[progressBar(showcase, minValue(0), maxValue(1), stepSize(0.1)):progress2]
```

```meta-bind
INPUT[progressBar(showcase, minValue(0), maxValue(10), stepSize(-1)):progress3]
```

```meta-bind
INPUT[progressBar(showcase, minValue(0), maxValue(10), stepSize(0.1)):progress4]
```

```meta-bind
INPUT[progressBar(defaultValue(53), class(red))]
```