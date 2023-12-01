---
playerCount: 6
playerLevel: 4
enemy:
  - name: Somthing
    level: 2
    count: 2
    variant: 0
  - name: Some other thing
    level: 2
    count: 1
    variant: 0
  - name: dragon
    level: 2
    count: 2
    variant: -1
  - name: test
    level: 1
    count: 1
    variant: 0
test:
  - a
  - b
  - c
---

### Party Info

Players: `INPUT[number:playerCount]`
Player Level: `INPUT[number:playerLevel]`

### Enemies

```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const bindTarget = mb.createBindTarget('enemy', context.file.path);
const tableHead = ['Name', 'Level', 'Variant', 'Count'];
const columns = [
	mb.inputField.createInputFieldDeclarationFromString('INPUT[text:scope^name]'),
	mb.inputField.createInputFieldDeclarationFromString('INPUT[number(class(meta-bind-small-width)):scope^level]'),
	mb.inputField.createInputFieldDeclarationFromString('INPUT[inlineSelect(option(-1, weak), option(0, normal), option(1, elite)):scope^variant]'),
	mb.inputField.createInputFieldDeclarationFromString('INPUT[number(class(meta-bind-small-width)):scope^count]')
];

mb.createTable(container, context.file.path, component, bindTarget, tableHead, columns);
```

### Encounter Stats

```meta-bind-js-view
{enemy} and children as enemies
{playerLevel} as playerLevel
---

function getXP(enemyLevel) {
	const diff = enemyLevel - context.bound.playerLevel;
	if (diff === -4) {
		return 10;
	}
	if (diff === -3) {
		return 15;
	}
	if (diff === -2) {
		return 20;
	}
	if (diff === -1) {
		return 30;
	}
	if (diff === 0) {
		return 40;
	}
	if (diff === 1) {
		return 60;
	}
	if (diff === 2) {
		return 80;
	}
	if (diff === 3) {
		return 120;
	}
	if (diff === 4) {
		return 160;
	}
	return -1;
}

function calculateTotalXP() {
	let acc = 0;
	for (const enemy of context.bound.enemies) {
		const xp = getXP((enemy.level ?? 0) + (enemy.variant ?? 0));
		if (xp === -1) {
			return -1;
		}
		acc += xp * (enemy.count ?? 0);
	}
	return acc;
}

return engine.markdown.create(`Encounter XP: **${calculateTotalXP()}**`);
```

> [!info] XP Reference
> 
> | Trivial                    | Low                        | Moderate                   | Severe                     | Extreme                    |
> | -------------------------- | -------------------------- | -------------------------- | -------------------------- | -------------------------- |
> | `VIEW[{playerCount} * 10]`    | `VIEW[{playerCount} * 15]`     | `VIEW[{playerCount} * 20]`    | `VIEW[{playerCount} * 30]`    | `VIEW[{playerCount} * 40]`    |