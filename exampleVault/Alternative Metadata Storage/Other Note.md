This input is bound to a global in memory cache.

`INPUT[text:globalMemory^test]`

`VIEW[{globalMemory^test} 123][text:globalMemory^test123]`

This input is bound to a per file in memory cache.

`INPUT[text:memory^test]`

`VIEW[{memory^test} 123][text:memory^test123]`

`VIEW[{memory^test123}456][text]`