---
playerCount: 6
playerLevel: 2
enemy:
  - name: Something
    level: 3
    count: 1
  - name: Some other thing
    level: 1
    count: 1
  - name: ""
    level: 0
    count: 0
  - name: ""
    level: 0
    count: 0
  - name: ""
    level: 0
    count: 0
---



### Party Info

Players: `INPUT[number:playerCount]`
Player Level: `INPUT[number:playerLevel]`

### Enemies

| Name                        | Level                        | Count                        |
| --------------------------- | ---------------------------- | ---------------------------- |
| `INPUT[text:enemy[0].name]` | `INPUT[number:enemy[0].level]` | `INPUT[number:enemy[0].count]` |
| `INPUT[text:enemy[1].name]` | `INPUT[number:enemy[1].level]` | `INPUT[number:enemy[1].count]` |
| `INPUT[text:enemy[2].name]` | `INPUT[number:enemy[2].level]` | `INPUT[number:enemy[2].count]` |
| `INPUT[text:enemy[3].name]` | `INPUT[number:enemy[3].level]` | `INPUT[number:enemy[3].count]` |
| `INPUT[text:enemy[4].name]` | `INPUT[number:enemy[4].level]` | `INPUT[number:enemy[4].count]` |

### Encounter Stats

```meta-bind-js-view
{enemy} and children as enemies
{playerCount} as playerCount
{playerLevel} as playerLevel
---

function getXP(enemyLevel) {
	const diff = enemyLevel - context.playerLevel;
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
	for (const enemy of context.enemies) {
		const xp = getXP(enemy.level);
		if (xp === -1) {
			return -1;
		}
		acc += xp * enemy.count;
	}
	return acc;
}

return "Encounter XP: " + calculateTotalXP()
```

> [!info] XP Reference
> 
> | Trivial                    | Low                        | Moderate                   | Severe                     | Extreme                    |
> | -------------------------- | -------------------------- | -------------------------- | -------------------------- | -------------------------- |
> | `VIEW[{playerCount} * 10]`    | `VIEW[{playerCount} * 15]`     | `VIEW[{playerCount} * 20]`    | `VIEW[{playerCount} * 30]`    | `VIEW[{playerCount} * 40]`    |