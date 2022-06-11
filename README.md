# Obsidian Meta Bind Plugin
This plugin can create input fields inside your notes and bind them to metadata fields.

### UNDER CONSTRUCTION
This plugin is not yet finished.

Planed features are:
- two-way sync (listening to file changes and updating the input fields)
- more input types

### How to use
To create an input field you have to write an inline code block starting with `INPUT`. Then in square brackets the type of input field and what metadata field to bind to.

Examples:
- `INPUT[toggle]` will create an unbound toggle
- `INPUT[slider:rating]` will create a slider bound to the metadata field `rating` of this note
- `INPUT[text:taks#completedOn]` will create a text input bound to the metadata field `completedOn` of the note with the name `task`

Be aware that the plugin might do unwanted things when you have multiple files with the same name in your vault.

### How to install
This plugin is still in **beta**.

You must manually download the zip archive from the latest release here on GitHub.  
After downloading, extract the archive into the `.obsidian/plugins` folder in your vault.

The folder structure should look like this:
```  
[path to your vault]  
|_ .obsidian  
   |_ plugins  
      |_ obsidian-meta-bind-plugin  
         |_ main.js  
         |_ manifest.json  
         |_ styles.css  
```

### Problems, unexpected behavior or improvement suggestions?
You are more than welcome to open an issue on [GitHub](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues).

### Contributions
Thank you for wanting to contribute to this project.

Contributions are always welcome. If you have an idea, feel free to open a feature request under the issue tab or even create a pull request.
