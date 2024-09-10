---
slider1: 80
slider2: 14
slider3: 227
slider4: 0.1
---

### Simple Slider

```meta-bind
INPUT[slider(showcase):slider1]
```

### Slider with Labels

```meta-bind
INPUT[slider(addLabels, showcase):slider1]
```

### Slider with Custom Min Max Values

```meta-bind
INPUT[slider(addLabels, minValue(-20), maxValue(20), showcase):slider2]
```

```meta-bind
INPUT[slider(addLabels, minValue(0), maxValue(1000), showcase):slider3]
```

### Slider with Custom Step Size

```meta-bind
INPUT[slider(addLabels, minValue(0), maxValue(10), stepSize(0.1), showcase):slider4]
```
