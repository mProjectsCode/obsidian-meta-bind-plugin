---
playerLevel: 6
---


### DC by Proficiency

| Proficiency | DC  |
| ----------- | --- |
| Untrained   | 10  |
| Trained     | 15  |
| Expert      | 20  |
| Master      | 30  |
| Legendary   | 40  |

### DC Adjustments

| Difficulty      | Adjustment |
| --------------- | ---------- |
| Incredibly Easy | -10        |
| Very Easy       | -5         |
| Easy            | -2         |
| Normal          | 0          |
| Hard            | +2         |
| Very Hard       | +5         |
| Incredibly Hard | +10        |

### DC Calculator

Level: `INPUT[number:playerLevel]`

| Difficulty      | Adjustment |
| --------------- | ---------- |
| Incredibly Easy | `VIEW[({playerLevel} < 20 ? {playerLevel} + 14 + floor({playerLevel} / 3) : {playerLevel} * 2) - 10]`        |
| Very Easy       | `VIEW[({playerLevel} < 20 ? {playerLevel} + 14 + floor({playerLevel} / 3) : {playerLevel} * 2) - 5]`         |
| Easy            | `VIEW[({playerLevel} < 20 ? {playerLevel} + 14 + floor({playerLevel} / 3) : {playerLevel} * 2) - 2]`         |
| Normal          | `VIEW[({playerLevel} < 20 ? {playerLevel} + 14 + floor({playerLevel} / 3) : {playerLevel} * 2)]`          |
| Hard            | `VIEW[({playerLevel} < 20 ? {playerLevel} + 14 + floor({playerLevel} / 3) : {playerLevel} * 2) + 2]`         |
| Very Hard       | `VIEW[({playerLevel} < 20 ? {playerLevel} + 14 + floor({playerLevel} / 3) : {playerLevel} * 2) + 5]`         |
| Incredibly Hard | `VIEW[({playerLevel} < 20 ? {playerLevel} + 14 + floor({playerLevel} / 3) : {playerLevel} * 2) + 10]`        |