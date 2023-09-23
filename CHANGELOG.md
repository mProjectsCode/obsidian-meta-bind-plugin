# Obsidian Meta Bind Changelog

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
