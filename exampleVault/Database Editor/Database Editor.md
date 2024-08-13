---
note title:
  - Mass
  - Force
  - Acceleration
---
# Select the files to edit their frontmatter

`INPUT[inlineListSuggester(optionQuery("Database Editor/Database"), useLinks(false)):["note title"]]`

# Generate Table With Editing Row and Rendered Row for Each File

```js-engine
const currentFilePath = context.file.path;

// Initialize Meta Bind plugin API
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const dv = engine.getPlugin('dataview').api;

// Define bind targets for the frontmatter fields
const bindTargetTitle = mb.parseBindTarget('["note title"]', currentFilePath);
console.log(bindTargetTitle);
const columns = ["title", "Type", "mathLink", "parent", "related", "dimensions", "staticdimensions", "Dimensions", "MKS", "CGS", "FPS", "Formula"];
const lines = ["title", "Type", "mathLink", "parent", "related", "dimensions", "staticdimensions", "mathLink-blocks.Dimensions", "mathLink-blocks.MKS", "mathLink-blocks.CGS", "mathLink-blocks.FPS", "mathLink-blocks.Formula"];

function updateFrontmatter(newContent) {
    mb.updateMetadata(bindTargetTitle, () => newContent);
}

function createWrappedInputField(inputType, filePath, container, component) {
    const div = container.createDiv();
    const inputField = mb.createInlineFieldFromString(inputType, filePath, undefined);
    mb.wrapInMDRC(inputField, div, component);
    return div;
}

return mb.reactiveMetadata([bindTargetTitle], component, async (titleList) => {
    if (!titleList || !Array.isArray(titleList) || titleList.length === 0) {
        new Notice("Title list is undefined, not an array, or empty");
        return;
    }

    let markdownTable = `
| ${columns.map(c => `${c}:`).join(' | ')} |
| ${columns.map(() => '---').join(' | ')} |`;

    for (const title of titleList) {
        const page = dv.page(title);
        if (!page || !page.file || !page.file.path) {
            new Notice(`Invalid page or path for title "${title}"`);
            continue;
        }

        const inputFields = [
            createWrappedInputField(`INPUT[text:${title}#title]`, currentFilePath, container, component),
            createWrappedInputField(`INPUT[inlineSelect(option(Variable), option(Sub_Variable), option(Dimension), option(Sub_Dimension), option(Vocabulary), option(Math_Operation), option(Constant), option(Folder)):${title}#Type]`, currentFilePath, container, component),
            createWrappedInputField(`INPUT[text:${title}#mathLink]`, currentFilePath, container, component),
            createWrappedInputField(`INPUT[inlineListSuggester(optionQuery("Database"), useLinks(partial)):${title}#parent]`, currentFilePath, container, component),
            createWrappedInputField(`INPUT[inlineListSuggester(optionQuery("Database"), useLinks(partial)):${title}#related]`, currentFilePath, container, component),
            createWrappedInputField(`INPUT[inlineListSuggester(optionQuery("Database"), useLinks(partial)):${title}#dimensions]`, currentFilePath, container, component),
            createWrappedInputField(`INPUT[inlineListSuggester(optionQuery("Database"), useLinks(partial)):${title}#staticdimensions]`, currentFilePath, container, component),
            createWrappedInputField(`INPUT[text:${title}#mathLink-blocks.Dimensions]`, currentFilePath, container, component),
            createWrappedInputField(`INPUT[text:${title}#mathLink-blocks.MKS]`, currentFilePath, container, component),
            createWrappedInputField(`INPUT[text:${title}#mathLink-blocks.CGS]`, currentFilePath, container, component),
            createWrappedInputField(`INPUT[text:${title}#mathLink-blocks.FPS]`, currentFilePath, container, component),
            createWrappedInputField(`INPUT[text:${title}#mathLink-blocks.Formula]`, currentFilePath, container, component),
        ];

        const viewColumns = lines.map(l => `\`VIEW[{${title}#${l}}][text(renderMarkdown)]\``);

        const inputRow = inputFields.map(field => field.outerHTML).join(' | ');
        const viewRow = viewColumns.join(' | ');

        markdownTable += `\n| ${inputRow} |\n| ${viewRow} |`;
    }

    new Notice("Markdown table generated successfully");
    return engine.markdown.create(markdownTable);
});
```
