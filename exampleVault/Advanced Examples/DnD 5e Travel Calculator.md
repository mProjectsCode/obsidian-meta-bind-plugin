---
BaseSpeed: 40
SpeedMultiplier: 0.666667
AdditionalBonus: 0
Encumbered: false
HorseshoesofSpeed: false
HoursPerDay: 8
MinutesPerMile: 20
ExhaustionLevel: 0
TravelDistance: 1000
varMins: 60
---

| DnD5e Travel Calculator |
| ---- |
| **Select Base Speed:** `INPUT[inlineSelect(option(30, Walking), option(50, Camel), option(40, Donkey), option(40, Mule), option(40, Draft Horse), option(40, Elephant), option(40, Mastiff), option(40, Moorbounder), option(40, Pony), option(40, Rhinoceros), option(60, Riding Horse), option(40, Saber-Toothed Tiger), option(60, Warhorse), option(20, Griffon [walking]), option(80, Griffon [flying]), option(40, Hippogriff [walking]), option(60, Hippogriff [flying]), option(60, Pegasus [walking]), option(90, Pegasus [flying]), option(20, Peryton [walking]), option(60, Peryton [flyingg]), option(50, Unicorn), option(60, Peryton [flying]), option(50, Unicorn), option(50, Broom of Flying), option(30, Broom of Flying [over  200 lbs]), option(80, Carpet of Flying [3ft x 5ft]), option(60, Carpet of Flying [4ft x 6ft]), option(40, Carpet of Flying [5ft x 7ft]), option(30, Carpet of Flying [6ft x 9ft]), option(300, Wind Walk), option(50, Cauldron of Flying), option(30, Cart pulled by Horses), option(30, Cart pulled by PCs), option(20, PHB Galley), option(5, PHB Keelboat), option(15, PHB Longship), option(10, PHB Rowboat), option(10, PHB Sailing Ship), option(15, PHB Warship), option(45, Aquisions Inc Battle Balloon), option(15, Aquisions Inc Mechanical Beholder), option(200, Ebberon Lyrandar Airship), option(100, Ebberon Lyrandar Galleon), option(300, Ebberon Orien Lightning Rail), showcase):BaseSpeed]` |
| **Select Travel Speed:** `INPUT[inlineSelect(option(1, Normal Pace), option(1.333333, Slow Pace), option(0.666667, Fast Pace), showcase):SpeedMultiplier]` |
| Additional Bonus Speed: `INPUT[number:AdditionalBonus]` |
| Encumbered: `INPUT[toggle:Encumbered]` (`VIEW[{Encumbered} ? -10 : 0]`) Horseshoes of Speed: `INPUT[toggle:HorseshoesofSpeed]` (`VIEW[{HorseshoesofSpeed} ? 30 : 0]`) |
| **Travel Hours Per Day:** `INPUT[number:HoursPerDay]` |
| Exhaustion Level: `INPUT[inlineSelect(option(0, 0 No exhaustion), option(1, 1 Disadvantage on ability checks), option(2, 2 Speed halved), option(3, 3 Disadvantage on attack rolls and saving throws), option(4, 4 Hit point maximum halved), option(5, 5 Speed reduced to 0), option(6, 6 Death)):ExhaustionLevel]` |
| New Base Speed: `VIEW[{BaseSpeed} / ({ExhaustionLevel} > 1 ? 2 : 1) + ({Encumbered} ? -10 : 0) + ({HorseshoesofSpeed} ? 30 : 0) + {AdditionalBonus}]` |
| Miles To Travel:  `INPUT[number:TravelDistance]` |
| **Days Travel 🕓:** `VIEW[round(({TravelDistance} * ({varMins}/(({BaseSpeed} / ({ExhaustionLevel} > 1 ? 2 : 1) + ({Encumbered} ? -10 : 0) + ({HorseshoesofSpeed} ? 30 : 0) + {AdditionalBonus}) / 10) * {SpeedMultiplier})) / 60 / {HoursPerDay}, 1)]` |

Check out this calculator on [Josh's Publish](https://obsidianttrpgtutorials.com/Obsidian+TTRPG+Tutorials/Plugin+Tutorials/Travel+Calculators/DnD+5e+Travel+Calc/DnD+5e+Travel+Calc).