---
progress1: -6
progress2: 0.7
progress3: 2
progress4: 2.6
progress5: 60
progress6: 75
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

The labels can be hidden if they are not required.

```meta-bind
INPUT[progressBar(defaultValue(53), addLabels(false)):progress5]
```
With some css-snippets we can change the color of the progress bar.

```meta-bind
INPUT[progressBar(defaultValue(53), class(red-progress-bar)):progress6]
```
