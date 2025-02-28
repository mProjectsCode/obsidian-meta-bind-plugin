const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

// the following shows how to customize meta-binds mathjs
mb.mathJSimport({
	// we define the function 'clamp'
	clamp:  (val, min, max) => Math.min(Math.max(min, val), max),
});
