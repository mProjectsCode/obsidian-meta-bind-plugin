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

const columns = ["title", "Type", "mathLink", "parent", "related", "dimensions", "staticdimensions", "Dimensions", "MKS", "CGS", "FPS", "Formula"];
const lines = ["title", "Type", "mathLink", "parent", "related", "dimensions", "staticdimensions", "mathLink-blocks.Dimensions", "mathLink-blocks.MKS", "mathLink-blocks.CGS", "mathLink-blocks.FPS", "mathLink-blocks.Formula"];

return mb.reactiveMetadata([bindTargetTitle], component, async (titleList) => {
    if (!titleList || !Array.isArray(titleList) || titleList.length === 0) {
        new Notice("Title list is undefined, not an array, or empty");
        return;
    }

    const container = component.containerEl;

    // Create and store input fields
    const inputFields = [];
    for (const title of titleList) {
        const page = dv.page(title);
        if (!page || !page.file || !page.file.path) {
            new Notice(`Invalid page or path for title "${title}"`);
            continue;
        }

        const path = page.file.path;
        //console.log(`Processing title: ${title}, Path: ${path}`);

        const titleInputs = lines.map(lines => {
            let inputString;
            switch (lines) {
                case "Type":
                    inputString = `INPUT[inlineSelect(option(Variable), option(Sub_Variable), option(Dimension), option(Sub_Dimension), option(Vocabulary), option(Math_Operation), option(Constant), option(Folder)):${title}#Type]`;
                    break;
                case "parent":
                case "related":
                case "dimensions":
                case "staticdimensions":
                    inputString = `INPUT[inlineListSuggester(optionQuery("Glossary"), useLinks(partial)):${title}#${lines}]`;
                    break;
                default:
                    inputString = `INPUT[text:${title}#${lines}]`;
            }
            
            const div = container.createDiv();
            try {
                const inputField = mb.createInlineFieldFromString(inputString, path);
                mb.wrapInMDRC(inputField, div, component);
                return div;
            } catch (error) {
                console.error(`Error creating input field for ${inputString}:`, error);
                div.textContent = `Error: ${error.message}`;
                return div;
            }
        });
        inputFields.push(titleInputs);
    }

    // Create table structure
    const table = container.createEl('table');
    const tableHead = table.createEl('thead');
    const headerRow = tableHead.createEl('tr');
    columns.forEach(column => {
        const th = headerRow.createEl('th');
        th.textContent = column;
    });

    const tableBody = table.createEl('tbody');

    // Populate table with input fields and views
    inputFields.forEach((titleInputs, index) => {
        const inputRow = tableBody.createEl('tr');
        titleInputs.forEach((inputDiv, colIndex) => {
            const td = inputRow.createEl('td');
            td.appendChild(inputDiv);
        });

        const viewRow = tableBody.createEl('tr');
        lines.forEach((line, colIndex) => {
            const td = viewRow.createEl('td');
            const title = titleList[index];
            const viewString = `VIEW[{${title}#${line}}][text(renderMarkdown)]`;
            const viewDiv = container.createDiv();
            try {
                const viewField = mb.createInlineFieldFromString(viewString, currentFilePath);
                mb.wrapInMDRC(viewField, viewDiv, component);
                td.appendChild(viewDiv);
            } catch (error) {
                console.error(`Error creating view field for ${viewString}:`, error);
                td.textContent = `Error: ${error.message}`;
            }
        });
    });

    new Notice("Table generated successfully");
    return table;
});
```
