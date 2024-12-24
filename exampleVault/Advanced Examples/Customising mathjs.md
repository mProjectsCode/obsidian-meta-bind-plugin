---
num: 6
---

```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const math = mb.getMathjs();

math.import({
	clamp: function (val, min, max) { 
		return Math.min(Math.max(min, val), max);
	}
}, {silent:true});
```

This is a clamped value: `VIEW[clamp({num}, 0, 10)][math]`
Test it with the slider

```meta-bind
INPUT[slider(minValue(-5),maxValue(15)):num]
```


> [!Note]
> Please note the second parameter for `math.import`. 
> Passing `silent:true` leads to the function <u>not</u> beeing updated on edit! (only on reload of meta-bind)
> Pass `override:true` to override the function everytime you switch between edit and viewing mode.