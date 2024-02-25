# Obsidian Meta Bind Plugin

A plugin for [Obsidian](https://obsidian.md/) to make your notes interactive with inline **input fields**, **metadata displays (view fields)**, and **buttons**.

Meta Bind allows you to create input and view fields inside your notes.
Those input and view fields can then be bound to frontmatter properties, which keeps them in sync those frontmatter properties.
Allowing you to edit and view your frontmatter properties inside your notes.

For example, you can create a toggle inside your note, that is bound to a frontmatter property named `done`, with this simple inline code block `INPUT[toggle:done]`.
When you click the toggle, the `done` property will switch between `true` and `false`.

To learn more, check out the [docs](https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs).

> [!WARNING]
> The next plugin version will probably be 1.0.0, which will include breaking changes to the plugins JavaScript API.

### Demo

![](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/raw/master/images/meta-bind-plugin-demo-3-gif.gif)

### Docs

The docs for the plugin are available [here](https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs).
The plugin provides an offline FAQ/Help page as well, which can be accessed via a command or the plugins settings page.

### Problems, unexpected behavior or improvement suggestions?

You are more than welcome to open an issue on [GitHub](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues).

### Contributions

Thank you for wanting to contribute to this project.

Contributions are always welcome. If you have an idea, feel free to open a feature request under the issue tab or even create a pull request.

#### Notes for Contributors

The plugin uses [Bun](https://bun.sh/) instead of Node.js/NPM to manage dependencies.
To install the dependencies, run `bun install` and `bun run pack:i` in the root directory of the project.

-   `bun run dev` will build the plugin in dev mode and watch for changes. The plugin builds directly into the example vault inside of this repo.
-   `bun run build` will build the plugin in production mode. The plugin builds into the root of this repo.
-   `bun run test` will run the tests.
-   `bun run check` will check for formatting, linting, type errors and run the tests.
-   `bun run check:fix` will fix formatting and linting errors, check for type errors and run the tests.

`bun run check` should run successfully before creating a pull request.
