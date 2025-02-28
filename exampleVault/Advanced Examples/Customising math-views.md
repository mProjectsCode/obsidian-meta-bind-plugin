---
num: 5
---

You may find yourself wanting to add functionalaty to the math-view elemnts. This file will show you some tricks how you can achive that.

## Importing new options into mathJS

The math-views internaly use the [mathJS](https://mathjs.org/) libary, which allows the user to define his own functions and constants, as described in [their documentation](https://mathjs.org/docs/core/extension.html).

To leverage that, Meta Bind exposed its mathjs instance for you to modify. The most sensible place to do this, is inside a JS-Engine startup-script. This ensures the moddifcatiosn are loaded early and will be imideatly availbe when the first documents gets rendered.

> [!warning]
> Moddifying mathJS via a js-engine codeblock inside a document may cause timing problems and is not recomended!


### Using a custom function `clamp`

As an example, we defined the `clamp()` function, which is not part of default mathJS, but can be very helpful.
It takes in three parameters, the current value, a minimum and a maximum. It teturns the current value as long as its inside the range otherwise the boundary-value.

```js
'clamp':  (val, min, max) => Math.min(Math.max(min, val), max)
```

As long as `mathJScustomisation.js` is loades as a strtup-script, we can now use this funcion in any math-view, like shown in this example:

This is a clamped value: `VIEW[clamp({num}, 0, 10)][math]` actual value: `VIEW[{num}][math]`
Test it with the slider

```meta-bind
INPUT[slider(minValue(-5),maxValue(15),addLabels):num]
```

