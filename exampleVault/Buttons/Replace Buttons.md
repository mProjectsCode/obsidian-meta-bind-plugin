### Two buttons that replace the same text

other
text
tada

```meta-bind-button
label: Replace in Note
hidden: false
class: ""
tooltip: ""
id: ""
style: default
action:
  type: "replaceInNote"
  fromLine: 3
  toLine: 5
  replacement: "some\ntext\nwow"
```

```meta-bind-button
label: Replace Other in Note
hidden: false
class: ""
tooltip: ""
id: ""
style: default
action:
  type: "replaceInNote"
  fromLine: 3
  toLine: 5
  replacement: "other\ntext\ntada"
```

### Inserting text into the file

Insert below this line:

```meta-bind-button
label: Insert Text
hidden: false
class: ""
tooltip: ""
id: ""
style: default
action:
  type: "insertIntoNote"
  line: 38
  value: "i am inserted"
```

```meta-bind-button
label: Remove inserted lines
hidden: false
class: ""
tooltip: ""
id: ""
style: default
action:
  type: "regexpReplaceInNote"
  regexp: "Insert below this line:\n(i am inserted\n)+"
  replacement: "Insert below this line:\n"
```

### A button replacing itself

```meta-bind-button
label: Replace Self
hidden: false
class: ""
tooltip: ""
id: ""
style: default
action:
  type: "replaceSelf"
  replacement: "i am no longer a button\n\nnice"
```

### A button reconstructing the button above with regexp replacement

```meta-bind-button
label: Recreate Button with Regexp
hidden: false
class: ""
tooltip: ""
id: ""
style: default
action:
  type: "regexpReplaceInNote"
  regexp: "i am no longer a button\\s+nice\n"
  replacement: |
    ```meta-bind-button
    label: Replace Self
    hidden: false
    class: ""
    tooltip: ""
    id: ""
    style: default
    action:
      type: "replaceSelf"
      replacement: "i am no longer a button\n\nnice"
    ```
```
