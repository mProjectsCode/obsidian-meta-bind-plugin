# Obsidian Meta Bind Plugin
This plugin can create input fields inside your notes and bind them to metadata fields.

### UNDER CONSTRUCTION
This plugin is not yet finished.

Planed features are:
- ranges for sliders
- more input types

### How to use
To create an input field you have to write an inline code block starting with `INPUT`. Then in square brackets the type of input field and what metadata field to bind to.

Examples:
- `INPUT[toggle]` will create an unbound toggle
- `INPUT[slider:rating]` will create a slider bound to the metadata field `rating` of this note
- `INPUT[text:task#completedOn]` will create a text input bound to the metadata field `completedOn` of the note with the name `task`

The plugin also allows further customization with arguments. So the complete syntax looks like this:
```
INPUT[input_type(argument_name(argument_value), argument_name_2, ...):file_name_or_path#metadata_field]
```

#### Input field types
- `slider` a slider from 0 to 100 (custom ranges are on the road map)
- `toggle` a toggle element
- `text` a text field

#### Arguments
- `class(class_name)` adds a css class to the input field
- `addLabels` only for slider, adds labels for the min and max values

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
#### The sync seems laggy
This is intentional. To reduce the load on your hard drive the plugin ony syncs about 5 times a second. 

You are more than welcome to open an issue on [GitHub](https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues).

### Contributions
Thank you for wanting to contribute to this project.

Contributions are always welcome. If you have an idea, feel free to open a feature request under the issue tab or even create a pull request.
