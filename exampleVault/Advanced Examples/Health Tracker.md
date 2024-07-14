---
health: 50
max_health: 50
damage: 5
---

```meta-bind-button
label: "Deal"
style: destructive
hidden: true
id: "deal-damage"
actions:
  - type: updateMetadata
    bindTarget: health
    evaluate: true
    value: x - getMetadata('damage')
```

```meta-bind-button
label: "Reset"
style: primary
hidden: true
id: "reset-health"
actions:
  - type: updateMetadata
    bindTarget: health
    evaluate: true
    value: getMetadata('max_health')
```

Health: `VIEW[{health}][text]` `BUTTON[reset-health]`

Damage: `INPUT[number:damage]` `BUTTON[deal-damage]`