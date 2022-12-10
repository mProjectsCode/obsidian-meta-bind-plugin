---
slider1: 44
slider2: 11
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
