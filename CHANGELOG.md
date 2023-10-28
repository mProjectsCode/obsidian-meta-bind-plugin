# Obsidian Meta Bind Changelog


# Unreleased

Breaking Changes

- Renamed all CSS variables to start with `mb-` for consistency

New Features

- View Fields can now render as plain text or as markdown e.g.
  - `VIEW[{a} * {b}]` or `VIEW[{a} * {b}][math]` this does math as before 
  - `VIEW[this is plain text][text]` this renders as plain text
  - `VIEW[this is **markdown**][text(renderMarkdown)]` this renders as markdown
  - `VIEW[this is hidden][text(hidden)]` this does not render
- View Fields can now save their computed value to another frontmatter property
  - `VIEW[{a} * {b}][math:c]` will save `a * b` in `c`
- Meta Bind Table, a way to build an expandable table from an array of objects where each cell is an input or view field
  - currently only accessible via the JavaScript API
- New Input Field type `listSuggester` a list where new items are added with a suggester
- New argument for `suggester`, `useLinks(true | false)` that can be used to turn off the usage of links
- New `stepSize` argument for `slider` and `progressBar`, thanks @dbarenholz
- New `limit` argument for `text` and `textArea`, thanks @dbarenholz

Changes
- Rewrote all Input Fields to fix Input Fields sometimes overriding frontmatter when changing the frontmatter manually in edit mode

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
