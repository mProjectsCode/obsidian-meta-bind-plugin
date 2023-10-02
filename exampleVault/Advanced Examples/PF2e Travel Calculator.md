---
BaseSpeed: 80
SpeedMultiplier: 0.5
HoursPerDay: 8
TravelDistance: 65
MilesPerHour: 3
TemperatureMaxTravelHours: 2
---

# Travel Speed
Updating the calculator below will flows the changes out to any notes that automatically calculate the travel distance. You need to refresh this note in order to see calculated changes. 

| PF2e Travel Calculator                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Party Speed (slowest):** `INPUT[inlineSelect(option(1, 10 Feet), option(1.5, 15 Feet), option(2, 20 Feet), option(2.5, 25 Feet),  option(3, 30 Feet),  option(3.5, 35 Feet),  option(4, 40 Feet),  option(5, 50 Feet),  option(6, 60 Feet)):MilesPerHour]`                                                                                    |
| **Terrain Type:** `INPUT[inlineSelect(option(1, Normal Terrain), option(0.5, Difficult Terrain), option(0.333333, Greater Difficult Terrain)):SpeedMultiplier]`                                                                                                                                                                                 |
| **Temperature:** `INPUT[inlineSelect(option(2, Incredible Cold - Moderate dmg every minute), option(4, Extreme Cold - Minor cold dmg every 10 minutes), option(4, Severe Cold - Minor cold dmg every hour), option(4, Mild Cold - None), option(8, Normal - None), option(4, Mild Heat - None), option(4, Severe Heat - Minor fire dmg every hour), option(4, Extreme Heat - Minor fire dmg every 10 minutes), option(2, Incredible Heat - Moderate fire dmg every minute)):TemperatureMaxTravelHours]` |
| **Max Travel Hours Per Day:** `VIEW[round({TemperatureMaxTravelHours},1)]`                                                                                                                                                                                                                                                                      |
| **Travel Hours Per Day:** `INPUT[number:HoursPerDay]` `VIEW[{HoursPerDay}>{TemperatureMaxTravelHours} ? "Suffer Fatigue" : "No Fatigue"]`                                                                                                                                                                                                                                                                                          |
| **Miles To Travel:**  `INPUT[number:TravelDistance]`                                                                                                                                                                                                                                                                                            |
| **Distance Travelled Per Day:** `VIEW[round({MilesPerHour}*{HoursPerDay},1)]`  miles                                                                                                                                                                                                                                                            |
| **Days Travel 🕓:** `VIEW[round({TravelDistance} / (({MilesPerHour}*{HoursPerDay})*{SpeedMultiplier}),1)]`                                                                                                                                                                                                                                                                                                                                                |

## Table 10-11: Environmental Damage

| **Category** | **Damage** |
| ------------ | ---------- |
| Minor        | 1d6-2d6    |
| Moderate     | 4d6-6d6    |
| Major        | 8d6-12d6   |
| Massive      | 16d6-24d6  |
