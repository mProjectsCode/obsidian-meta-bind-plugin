## Releasing & naming

- [x] Remove placeholder names such as `MyPlugin` and `SampleSettingTab`.
- [x] Don't include the word "Obsidian" in your name unless it absolutely makes sense. Most of the time it's redundant.
- [x] Don't include your plugin name in command names. Obsidian adds this for you.
- [x] Don't prefix commands with your plugin ID. Obsidian adds this for you.
- [x] Don't include `main.js` in your repo. Only include it in your releases.
- [x] If you haven't, consider add a `fundingUrl` so that users of your plugin can show some support. [Learn more](https://docs.obsidian.md/Reference/Manifest#fundingUrl).

## Compatibility

- [x] Don't provide default hotkeys when possible. [Learn more](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Avoid+setting+a+default+hotkey+for+commands).
- [x] Don't override core styling. If needed, add your own class and make the styling only apply to your class.
- [x] Do scan your code for deprecated methods (they usually show up as strikeout text in IDEs).
- [x] Don't assign styles via JavaScript or in HTML. [Learn more](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#No+hardcoded+styling).
- [x] Don't access the hardcoded `.obsidian` folder if you need to access the configuration directory. The location could be customized, so please use `Vault.configDir` instead.

## Mobile support

Please only complete this section if you have `isDesktopOnly` set to false in your manifest.

- [x] Don't use node.js modules such as `fs`, `path`, and `electron`.
- [x] Don't use regex lookbehinds if you want to support iOS versions lower than 16.4 (ignore this if you don't use regex in your plugin). [Learn more](https://docs.obsidian.md/Plugins/Getting+started/Mobile+development#Lookbehind+in+regular+expressions).
- [x] Don't use the `FileSystemAdapter` class.
- [x] Don't use `process.platform`, use Obsidian's `Platform` instead. [Link to API](https://docs.obsidian.md/Reference/TypeScript+API/Platform).
- [x] Don't use `fetch` or `axios.get`, use Obsidian's `requestUrl` instead. [Link to API](https://docs.obsidian.md/Reference/TypeScript+API/requestUrl).

## Coding style

- [x] Don't use `var`. Use `let` or `const` instead. [Learn more](https://javascript.plainenglish.io/4-reasons-why-var-is-considered-obsolete-in-modern-javascript-a30296b5f08f).
- [x] Don't use the global `app` instance. Use `this.app` provided to your plugin instance instead. [Learn more](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Avoid%20using%20global%20app%20instance).
- [x] Do break up your `main.ts` into smaller files or even folders if it gets big to make code easier to find.
- [x] Don't use `Promise`. Use `async` and `await` instead. [Learn more](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Prefer+async%2Fawait+over+Promise).
- [x] Don't use global variables. Try to keep variables either in the scope of classes or functions. [Learn more](http://wiki.c2.com/?GlobalVariablesAreBad).
- [x] Do test with `instanceof` before casting into other types such as `TFile`, `TFolder`, or `FileSystemAdapter`, 
- [x] Don't use use `as any` and use proper typing instead.


## API usage

- [x] Don't use `Vault.modify`. If you want to edit the active file, prefer using the `Editor` interface. If you want to edit it in the background, use `Vault.process`.
- [x] Don't manually read and write frontmatter. Instead, use `FileManager.processFrontMatter`. [Learn more](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Prefer+%60FileManager.processFrontMatter%60+to+modify+frontmatter+of+a+note).
- [x] Don't use `vault.delete` to delete files. Use `trashFile` instead to make sure the file is deleted according to the users preferences. [Learn more](https://docs.obsidian.md/Reference/TypeScript+API/FileManager/trashFile).
- [x] Don't use the `Adapter` API whenever possible. Use `Vault` API instead. [Learn more](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Prefer+the+Vault+API+over+the+Adapter+API).
- [x] Don't manage reading and write plugin data yourself. Use `Plugin.loadData()` and `Plugin.saveData()` instead.
- [ ] Do use `normalizePath()` if you take user defined paths. [Learn more](https://docs.obsidian.md/Reference/TypeScript+API/normalizePath).


## Performance

- [x] Do optimize your plugin's load time. [Detailed guide](https://docs.obsidian.md/Plugins/Guides/Optimizing+plugin+load+time).
- [x] Don't iterate all files to find a file or folder by its path. [Learn more](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Avoid+iterating+all+files+to+find+a+file+by+its+path).
- [x] If you want your plugins to be compatible with Obsidian 1.7.2+ (currently in early access), update your plugin to work with `DeferredViews`. [Detailed guide](https://docs.obsidian.md/Plugins/Guides/Understanding+deferred+views).
- [ ] If you're using `moment`, make sure you're doing `import { moment} from 'obsidian'` so that you don't import another copy.
- [x] Do minimize your `main.js` for releasing.

## User interface

- [x] Don't use setting headings unless you have more than one section. [Learn more](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Only+use+headings+under+settings+if+you+have+more+than+one+section).
- [x] Don't include the word "setting" or "option" in setting headings. [Learn more](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Avoid+%22settings%22+in+settings+headings).
- [x] Do use sentence case in all text in UI elements to be consistent with rest of Obsidian UI. [Learn more](https://en.wiktionary.org/wiki/sentence_case).
- [x] Don't use `<h1>` or `<h2>` for setting header. Use Obsidian API instead. [Learn more](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Use+%60setHeading%60+instead+of+a+%60%3Ch1%3E%60%2C+%60%3Ch2%3E%60).
- [x] Don't do `console.log` unless they are absolutely necessarily. Remove testing console logs that are not needed for production.