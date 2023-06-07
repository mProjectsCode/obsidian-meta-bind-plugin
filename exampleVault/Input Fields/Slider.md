---
slider1: 31
slider2: 6
slider3: 580
---

### Simple Slider
```meta-bind
INPUT[slider(showcase):slider1]
```

### Slider with Labels
```meta-bind
INPUT[slider(addLabels, showcase):slider1]
```

### Slider with custom min max values
```meta-bind
INPUT[slider(addLabels, minValue(-20), maxValue(20), showcase):slider2]
```

```meta-bind
INPUT[slider(addLabels, minValue(0), maxValue(1000), showcase):slider3]
```
