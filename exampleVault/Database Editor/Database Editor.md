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

        const inputColumns = [
            `\`INPUT[text:${title}#title]\``,
            `\`INPUT[inlineSelect(option(Variable), option(Sub_Variable), option(Dimension), option(Sub_Dimension), option(Vocabulary), option(Math_Operation), option(Constant), option(Folder)):${title}#Type]\``,
            `\`INPUT[text:${title}#mathLink]\``,
            `\`INPUT[inlineListSuggester(optionQuery("Glossary"), useLinks(partial)):${title}#parent]\``,
            `\`INPUT[inlineListSuggester(optionQuery("Glossary"), useLinks(partial)):${title}#related]\``,
            `\`INPUT[inlineListSuggester(optionQuery("Glossary"), useLinks(partial)):${title}#dimensions]\``,
            `\`INPUT[inlineListSuggester(optionQuery("Glossary"), useLinks(partial)):${title}#staticdimensions]\``,
            `\`INPUT[text:${title}#mathLink-blocks.Dimensions]\``,
            `\`INPUT[text:${title}#mathLink-blocks.MKS]\``,
            `\`INPUT[text:${title}#mathLink-blocks.CGS]\``,
            `\`INPUT[text:${title}#mathLink-blocks.FPS]\``,
            `\`INPUT[text:${title}#mathLink-blocks.Formula]\``,
        ];

        const viewColumns = lines.map(l => `\`VIEW[{${title}#${l}}][text(renderMarkdown)]\``);

        const inputRow = inputColumns.join(' | ');
        const viewRow = viewColumns.join(' | ');

        markdownTable += `\n| ${inputRow} |\n| ${viewRow} |`;
    }

    new Notice("Markdown table generated successfully");
    const markdownElement = engine.markdown.create(markdownTable);

    // Wrap each input field in MDRC after rendering
    setTimeout(() => {
        const inputFields = markdownElement.querySelectorAll('span.cm-inline-code');
        inputFields.forEach(field => {
            const div = document.createElement('div');
            field.parentNode.insertBefore(div, field);
            div.appendChild(field);
            mb.wrapInMDRC(field, div, component);
        });
    }, 0);

    return markdownElement;
});
```
