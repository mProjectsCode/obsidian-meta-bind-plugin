# Obsidian Meta Bind Plugin

Meta Bind allows you to create input and view fields inside your notes. 
Those input and view fields can then be bound to frontmatter properties, which keeps them in sync those frontmatter properties.
Allowing you to edit and view your frontmatter properties inside your notes.

For example, you can create a toggle inside your note, that is bound to a frontmatter property named `done`, with this simple inline code block `INPUT[toggle:done]`.
When you click the toggle, the `done` property will switch between `true` and `false`.

To learn more, check out the [docs](https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs).

### Demo

![](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/raw/master/images/meta-bind-plugin-demo-3-gif.gif)

### Docs

The docs for the plugin are available [here](https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs).
The plugin provides an offline FAQ/Help page as well, which can be accessed via a command or the plugins settings page.

### Problems, unexpected behavior or improvement suggestions?

You are more than welcome to open an issue on [GitHub](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues).

#### The sync seems laggy / It takes half a second for the changes to sync

This is intentional. To reduce the load on your hard drive the plugin ony syncs about 5 times a second.
There is a setting to change the sync interval, but I don't recommend changing it.

### Contributions

Thank you for wanting to contribute to this project.

Contributions are always welcome. If you have an idea, feel free to open a feature request under the issue tab or even create a pull request.

#### Notes for Contributors

The plugin uses [Bun](https://bun.sh/) instead of Node.js/NPM to manage dependencies.
To install the dependencies, run `bun install` in the root directory of the project.

- `bun run dev` will build the plugin in dev mode and watch for changes. The plugin builds directly into the example vault inside of this repo.
- `bun run build` will build the plugin in production mode. The plugin builds into the root of this repo.
- `bun run test` will run the tests.
- `bun run check` will check for formatting, linting, type errors and run the tests.
- `bun run check:fix` will fix formatting and linting errors, check for type errors and run the tests.

`bun run check` should run successfully before creating a pull request.
