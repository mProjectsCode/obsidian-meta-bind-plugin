# Obsidian Meta Bind Changelog

# 1.1.0

Changes

-   Added syntax highlighting for JS View Fields
-   Added option to hide JS View Fields
-   Button actions now accept links as file paths [#297]](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/297)
-   Renamed the FAQ to Playground [#293]](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/293)

Bug Fixes

-   Fixed `templaterCreateNote` Button Action always opening the created note [#298]](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/298)
-   Fixed not being able to click input fields inside of callouts in LP [#291]](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/291)

# 1.0.4

Changes

-   Slightly improved the syncing algorithm and reduced the amount of unnecessary updates

Bug Fixes

-   Fixed some issues with the `replaceSelf` button action not replacing the correct lines when the button was moved by some change in the part of the note above the button
-   Fixed some unusable API functions for creating meta bind tables, as the required arguments weren't possible to create just using the API

# 1.0.3

Bug Fixes

-   Fixed list type inputs interpreting `null` as `[null]`, now `null` is treated as an empty list [#280](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/280)

# 1.0.2

Bug Fixes

-   Fixed button templates not being saved correctly [#277](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/277)

# 1.0.1

Bug Fixes

-   Fixed some issues with the button builder and the button template settings [#276](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/276)

# 1.0.0

New Features

-   Added new input field `imageListSuggester`, a list variant of the `imageSuggester` input field [#193](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/193)
-   Added new input field `dateTime`, a combined date and time input field, using the native obsidian data time input [#193](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/193)
-   Added new input field argument `multiLine` to add multi line support to the `list` input field [#232](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/242)
-   Added new input field argument `allowOther` to allow non suggester values to the `suggester`, `listSuggester` and `inlineListSuggester` input fields [#234](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/234)
-   Added new view field `ìmage` to display images in the note, it functions similar to the link view field [#246](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/246)
-   Added new view field argument `class` to all view fields to add custom classes to the view field, similar to the `class` input field argument [#260](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/260)
-   Added new button action `createNote` to create a new note [#206](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/206)
-   Added new button action `replaceInNote` to replace lines in the note of the button [#206](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/206)
-   Added new button action `regexpReplaceInNote` to replace run a regular expression replace in the note of the button [#206](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/206)
-   Added new button action `insertIntoNote` to insert text at a specified line in the note of the button [#206](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/206)
-   Added new button action `replaceSelf` to replace the button with a string or templater template [#206](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/206)
-   Added new button action `inlineJS` to run a JavaScript snippet
-   Added the option to add icons to buttons [#273](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/273)
-   Added a command to easily copy command IDs to the clipboard [#247](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/247)
-   Added support for reordering in all list type input fields
-   Added support for editing in some list type input fields

Changes

-   **BREAKING** Completely reworked the plugins JavaScript API
-   Restyled the following input fields: `list`, `listSuggester`, `inlineList`, `inlineListSuggester`, `imageSuggester`, `imageListSuggester`, `select` and `multiSelect` to be more in line with Obsidian's design
-   Changed the date and time input fields to use the native obsidian date and time inputs
-   Added the ability for the `open` button action to open the link in a new tab
-   Added the button config and args as available variables in the JS button action [#242](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/242)
-   Added view field examples into the FAQ [#186](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/186)
-   Major restructuring of the plugin codebase to allow for easier development on the publish version of the plugin

Bug Fixes

-   Fixed FAQ not opening [#230](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/230)
-   Fixed an issue with settings reverting when using a sync service [#235](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/235)
-   Fixed in issue where the plugin would sometimes incorrectly complain about duplicate button ids

# 0.12.5

Bug Fixes

-   Fixed an issue with the Button Builder throwing an error when closed [#224](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/224)

# 0.12.4

Bug Fixes

-   Fixed an issue with JS View Fields not correctly handling the lifecycle of rendered markdown [#222](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/222)

# 0.12.3

Bug Fixes

-   Fixed templater create note button action not working [#221](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/221)

# 0.12.2

Bug Fixes

-   Fixed not cloning the metadata object given by the Obsidian API

Changes

-   A lot of internal changes while working on the publish plugin. This should not change anything for users.

# 0.12.1

Bug Fixes

-   Fixed an issue with the button id collision triggering when it shouldn't [#207](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/207)
-   Fixed a minor memory leak in the button manager
-   Fixed an error being thrown when deleting or renaming a note

# 0.12.0

New Features

-   Added options to insert example input and view fields, as well as buttons, from the editor context menu [#179](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/179)
-   Added the option to control if a note should be opened in a new tab to the `open` button action [#178](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/178)
-   Added button templates that can be edited from the plugin settings

Changes

-   Improved validation errors for buttons and the API
-   Removed deprecated input fields that had names in snake_case. Use the camelCase variants instead. The snake_case variants were deprecated since version `0.6.0`.
-   Reworked the UI for the input field template modal
-   Made substantial internal changes to the way the plugin handles metadata
-   Changed the plugin name to `Meta Bind` to comply with the new Obsidian plugin naming requirements
-   Removed some unnecessary console logs to comply with the Obsidian plugin guidelines

Bug Fixes

-   Fixed an issue with the `stepSize` argument causing floating point errors under specific conditions when used with the `progressBar` input [#180](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/180)
-   Fixed parsing errors not showing in the input field template modal
-   Fixed button id collisions [#187](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/187)
-   Fixed buttons not unloading on file rename or delete [#187](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/187)
-   Fixed not being able to scroll the `editor` input field [#161](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/161)
-   Fixed the `editor` input field overflowing [#190](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/190)

# 0.11.0

New Features

-   Meta Bind Buttons can now update metadata (implements [#160](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/160))
-   CSS Classes can now be added to Meta Bind Buttons
-   A tooltip that is different from the label can now be added to Meta Bind Buttons (implements [#170](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/170))
-   The `useLinks` argument for suggester like input fields now supports the `partial` value. (implements [#151](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/151))

Changes

-   The computed value of math view fields will now be saved as a number if it is a number

Bug Fixes

-   Fixed a multitude of small issues related to unloading and the button builder

# 0.10.2

Changes

-   Updated dependencies to JS Engine 0.1.0

# 0.10.1

Bug Fixes

-   Fixed a bug with suggesters using Dataview not opening the suggester modal [#159](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/159)

# 0.10.0

New Features

-   Meta Bind Buttons: Create buttons inside your notes that can trigger actions on click. A spiritual successor to the discontinued Buttons Plugin.
-   Syntax Highlighting: Meta Bind now has syntax highlighting for all its syntaxes in source mode and in live preview.
-   Multiple Bind Target Storage Types: You can not choose to store intermediate inputs or view field outputs in memory. That way they won't clutter your frontmatter.

Changes

-   The way to reference scope in the Meta Bind Table has changed from `^.property` to `scope^property`.

Bug Fixes

-   Fixed a bug related to `null` and default values of input fields [#148](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/148)

# 0.9.0

New Features

-   Meta Bind Embed, a way to embed a note (Note B) in another note (Note A) and have all the input fields think they are part of note A

Changes

-   Improved the handling of nested metadata a lot, fixing [#52](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/52) in the process
-   A lot more input fields will now recognize links and render them as links [#141](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/141)
-   You can now unselect an element in the `select` input field by clicking on it again [#145](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/145)

Bug Fixes

-   Style fixes for Obsidian 1.5.0
-   Fixed a bug with the meta bind table
-   Fixed a multitude of bugs relating to how input fields handle frontmatter values that are invalid for that input field, thanks to a lot of new automated tests

# 0.8.0

New Features

-   The in plugin offline FAQ/Help Page now includes a preview of all available input fields
-   New view field type `link`
    -   displays a link to the note specified in the metadata
    -   works with lists of notes
    -   works with external URLs
-   The `imageSuggester` will now find all images in your vault if the string passed to `optionQuery` is empty like this `optionQuery("")`

Breaking Changes

-   removed setting migrations for settings from plugin versions earlier than `0.6.0`
-   migrated the JS View Field to use JS Engine
    -   the docs will include a migration guide soon

Bug Fixes

-   Fixed metadata cache does not update on file rename or delete [#142](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/142)
    -   now all Input and View Fields bound to the renamed or deleted note will unload

# 0.7.2

Changes

-   some style tweaks to the image suggester
-   image suggester now finds images in sub folder
-   image suggester modal is now searchable
-   new input field type `inlineListSuggester`
-   new input field type `inlineList`

# 0.7.1

New Features

-   new command to open the docs
-   new command to open an offline in plugin FAQ
-   new setting to display null as empty in text view fields

Changes

-   made error messages more readable and added links to documentation in some places

Bug Fixes

-   fixed: Square brackets are not allowed in view fields [#136](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/136)
-   fixed: Lists don't display correctly inside of text view fields [#132](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/132)
-   fixed: bind target frontmatter ident parser fails to parse ident with non ascii letters [#119](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues/119)

# 0.7.0

Breaking Changes

-   Renamed all CSS variables to start with `mb-` for consistency

New Features

-   View Fields can now render as plain text or as markdown e.g.
    -   `VIEW[{a} * {b}]` or `VIEW[{a} * {b}][math]` this does math as before
    -   `VIEW[this is plain text][text]` this renders as plain text
    -   `VIEW[this is **markdown**][text(renderMarkdown)]` this renders as markdown
    -   `VIEW[this is hidden][text(hidden)]` this does not render, useful for computations that save their value
-   View Fields can now save their computed value to another frontmatter property
    -   `VIEW[{a} * {b}][math:c]` will save `a * b` in `c`
-   Meta Bind Table, a way to build an expandable table from an array of objects where each cell is an input or view field
    -   currently only accessible via the JavaScript API
-   New Input Field type `listSuggester` a list where new items are added with a suggester
-   New argument for `suggester`, `useLinks(true | false)` that can be used to turn off the usage of links
-   New `stepSize` argument for `slider` and `progressBar`, thanks @dbarenholz
-   New `limit` argument for `text` and `textArea`, thanks @dbarenholz

Changes

-   Rewrote all Input Fields to fix Input Fields sometimes overriding frontmatter when changing the frontmatter manually in edit mode

# 0.6.3

Bug Fixes

-   fixed inline select not treating numbers and booleans as numbers and booleans, but as strings

# 0.6.1

Bug Fixes

-   fixed a bug with the settings migration causing the settings to be deleted

# 0.6.0

New Features

-   `list` input field
-   `defaultValue` input field argument
    -   lets you define a custom default value for an input field
    -   works on any input field
-   `placeholder` input field argument
    -   lets you define a placeholder value to be displayed in the input field, if no value is set
    -   works on the following input fields `text`, `textArea`, `number` and `list`
-   specific folders can now be excluded in the setting, excluding means that the plugin will not show input or view fields in these folders
-   the `option` argument now allows for a name and a value, e.g. `option(value, displayName)`
-   numbers and booleans will now be recognized and treated as such
    -   e.g. `option(5, 5 Stars)` will set the metadata to the number 5 instead of the string '5'
    -   e.g. `offValue(0)` will set the metadata to the number 0 instead of the string '0'

Changes

-   new parser for input fields, view fields and bind targets
    -   input fields now display way better error messages
    -   I tried not to introduce breaking changes, but some might have slipped through
    -   this is also why the update took so long
-   new API to create input field using code (e.g. using dataviewJS or [JS Engine](https://github.com/mProjectsCode/obsidian-js-engine-plugin))
    -   this is a breaking change
-   deprecated some input fields that had names in snake_case for camelCase names

Bug Fixes

-   fixed a bug with the metadata cache when the frontmatter was invalid
-   fixed a bug with view fields that caused an error when referencing metadata from another file
-   fixed`toggle` with `offValue` sometimes showing the wrong toggle state

# 0.5.1

Minor Changes

-   added a setting to disable JS View Fields

# 0.5.0

New Features

-   Live Preview support (thanks to koala on discord for helping me with this)
-   Obsidian Publish support (docs page coming soon, thanks to Sigrunixia on discord for letting me test on her publish account)
-   View Fields, a way to reactively display your metadata using mathjs
-   Inline Select input field (more or less a dropdown select)
-   Progress Bar input field (a bigger full note width slider)
-   On and Off Value arguments for the Toggle input field (specify custom on and off values for the toggle)
-   new error handling system that supports warnings

Minor Changes

-   added timed cache retention to the plugins on demand metadata cache

Bug Fixes

-   fixed a bug with the metadata cache needlessly updating the frontmatter
-   fixed some mistakes in the docs

# 0.4.X

No changelog available.
