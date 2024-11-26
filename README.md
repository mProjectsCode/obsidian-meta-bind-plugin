# Obsidian Meta Bind Plugin

A plugin for [Obsidian](https://obsidian.md/) to make your notes interactive with inline **input fields**, **metadata displays (view fields)**, and **buttons**.

Meta Bind allows you to create input and view fields inside your notes.
Those input and view fields can then be bound to frontmatter properties, which keeps them in sync with those frontmatter properties.
This allows you to edit and view your frontmatter properties inside your notes.

For example, you can create a toggle inside your note, that is bound to a frontmatter property named `done`, with this simple inline code block `INPUT[toggle:done]`.
When you click the toggle, the `done` property will switch between `true` and `false`.

To learn more, check out the [docs](https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs).

## Demo

![](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/raw/master/images/meta-bind-plugin-demo-3-gif.gif)

## Docs

The docs for the plugin are available [here](https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs).
The plugin provides an offline FAQ/Help page as well, which can be accessed via a command or the plugins settings page.

## Problems, unexpected behavior or improvement suggestions?

You are more than welcome to open an issue on [GitHub](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues)

## Installation

### Obsidian Marketplace (Recommended)

1. Open `Settings -> Community Plugins` in your vault
2. Click on the `Browse` button in the `Community plugins` section
3. Search for `Meta Bind`
4. Select `Meta Bind` and click first `Install`, then `Enable`

### BRAT (For Canary Releases)

1. Install and enable the `BRAT` plugin
2. Run the `BRAT: Plugins: Add a beta plugin for testing` command
3. Enter `https://github.com/mProjectsCode/obsidian-meta-bind-plugin` into the text field
4. Click on `Add Plugin`

## License

[GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/)

## Credits

I want to thank the following people:

- blacksmithgu for the Dataview type definitions
- Daniel (dbarenholz) for his contributions to the plugin and the docs
- koala (kometenstaub) for help with CodeMirror
- sailKite for help with CSS
- Sigrunixia for enabling me to work on the Obsidian Publish version of the plugin
- Zachatoo and SilentVoid13 for the Templater type definitions

- All the contributors to the plugin and the docs
- All the authors of the libraries used in the plugin
- Everyone who has given feedback and suggestions

## Contributions

Thank you for wanting to contribute to this project.

Contributions are always welcome. If you have an idea, feel free to open a feature request under the issue tab or even create a pull request.

### Notes for Contributors

The plugin uses [Bun](https://bun.sh/) instead of Node.js/NPM to manage dependencies.
To install the dependencies, run `bun install` and `bun run pack:i` in the root directory of the project.

- `bun run dev` will build the plugin in dev mode and watch for changes. The plugin builds directly into the example vault inside of this repo.
- `bun run build` will build the plugin in production mode. The plugin builds into the root of this repo.
- `bun run test` will run the tests.
- `bun run check` will check for formatting, linting, type errors and run the tests.
- `bun run check:fix` will fix formatting and linting errors, check for type errors and run the tests.

`bun run check` should run successfully before creating a pull request.
