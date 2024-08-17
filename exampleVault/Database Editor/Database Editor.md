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
                    inputString = `INPUT[inlineListSuggester(optionQuery("Database Editor"), useLinks(partial)):${title}#${lines}]`;
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

# Or Use Values Stored in Memory to Populate a Table with Filters

```js-engine
const currentFilePath = context.file.path;

// Initialize Meta Bind and Dataview plugin APIs
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const dv = engine.getPlugin('dataview').api;

// Component for lifecycle management of fields
const comp = new obsidian.Component(component);

// Extract unique options for each filter
const parentOptions = Array.from(new Set(dv.pages('"Database Editor/Database"').flatMap(p => p.file.frontmatter.parent || []).filter(Boolean)));
const TypeOptions = Array.from(new Set(dv.pages('"Database Editor/Database"').map(p => p.file.frontmatter.Type || '').filter(Boolean)));
const relatedOptions = Array.from(new Set(dv.pages('"Database Editor/Database"').flatMap(p => p.file.frontmatter.related || []).filter(Boolean)));
const dimensionsOptions = Array.from(new Set(dv.pages('"Database Editor/Database"').flatMap(p => p.file.frontmatter.dimensions || []).filter(Boolean)));

// Define bind targets for filters
const bindTargetLocked = mb.parseBindTarget('memory^locked', currentFilePath);
const bindTargetFileName = mb.parseBindTarget('memory^fileNameFilter', currentFilePath);
const bindTargetParent = mb.parseBindTarget('memory^parentFilter', currentFilePath);
const bindTargetType = mb.parseBindTarget('memory^TypeFilter', currentFilePath);
const bindTargetRelated = mb.parseBindTarget('memory^relatedFilter', currentFilePath);
const bindTargetDimensions = mb.parseBindTarget('memory^dimensionsFilter', currentFilePath);

// Table columns and lines
const columns = ["title", "Type", "mathLink", "parent", "related", "dimensions", "staticdimensions", "down", "Dimensions", "MKS", "CGS", "FPS", "Formula"];
const lines = ["title", "Type", "mathLink", "parent", "related", "dimensions", "staticdimensions", "down", "mathLink-blocks.Dimensions", "mathLink-blocks.MKS", "mathLink-blocks.CGS", "mathLink-blocks.FPS", "mathLink-blocks.Formula"];

// Create dropdown inputs
function createDropdown(id, options) {
    return `INPUT[inlineSelect(title(${id}), defaultValue(null), option(null), ${options.map(option => `option(${option})`).join(',')}):memory^${id}]`;
}

// Render filters and table
async function renderTable() {
    comp.unload();
    comp.load();
    container.empty();

    // Check if the locked toggle is activated
    const isLocked = await mb.getMetadata(bindTargetLocked);

    // Define filter fields and labels
    const filterFields = [
        {
            label: "Display Table:",
            field: `INPUT[toggle:memory^locked]`
        },
        {
            label: "File Name:",
            field: isLocked ? `VIEW[{memory^fileNameFilter}][text(renderMarkdown)]` : `INPUT[text(placeholder(File Name)):memory^fileNameFilter]`
        },
        {
            label: "Parent:",
            field: isLocked ? `VIEW[{memory^parentFilter}][text(renderMarkdown)]` : createDropdown('parentFilter', parentOptions)
        },
        {
            label: "Type:",
            field: isLocked ? `VIEW[{memory^TypeFilter}][text(renderMarkdown)]` : createDropdown('TypeFilter', TypeOptions)
        },
        {
            label: "Related:",
            field: isLocked ? `VIEW[{memory^relatedFilter}][text(renderMarkdown)]` : createDropdown('relatedFilter', relatedOptions)
        },
        {
            label: "Dimensions:",
            field: isLocked ? `VIEW[{memory^dimensionsFilter}][text(renderMarkdown)]` : createDropdown('dimensionsFilter', dimensionsOptions)
        }
    ];

    // Create a container to hold the filter fields with labels
    const filterContainer = container.createDiv({ cls: 'filter-container' });

    // Render filter fields with labels
    filterFields.forEach(({ label, field }) => {
        const labelEl = filterContainer.createEl('div', { cls: 'filter-label', text: label });
        labelEl.style.marginBottom = '5px';
        labelEl.style.fontWeight = 'bold';

        const fieldContainer = filterContainer.createDiv({ cls: 'filter-field' });
        const renderedField = mb.createInlineFieldFromString(field, currentFilePath, undefined);
        mb.wrapInMDRC(renderedField, fieldContainer, comp);
    });

    if (!isLocked) {
        return; // Do not proceed with metadata retrieval or table rendering if not locked
    }

    // Get the filter values dynamically from memory
    const fileName = await mb.getMetadata(bindTargetFileName);
    const parent = await mb.getMetadata(bindTargetParent);
    const type = await mb.getMetadata(bindTargetType);
    const related = await mb.getMetadata(bindTargetRelated);
    const dimensions = await mb.getMetadata(bindTargetDimensions);

    // Perform query using filters
    const query = dv.pages('"Database Editor/Database"')
        .where(p => (!fileName || p.file.name.toLowerCase().includes(fileName.toLowerCase())) &&
            (!parent || (p.file.frontmatter.parent || []).includes(parent)) &&
            (!type || p.file.frontmatter.Type === type) &&
            (!related || (p.file.frontmatter.related || []).includes(related)) &&
            (!dimensions || (p.file.frontmatter.dimensions || []).includes(dimensions))
        );

    if (!query || query.length === 0) {
        new Notice("No files found with the selected filters");
        return;
    }

    // Create and store input fields
    const inputFieldsArr = [];
    for (const page of query) {
        const title = page.file.name;
        const titleInputs = lines.map(line => {
            let inputString;
            switch (line) {
                case "Type":
                    inputString = `INPUT[inlineSelect(option(Variable), option(Sub_Variable), option(Dimension), option(Sub_Dimension), option(Vocabulary), option(Math_Operation), option(Constant), option(Folder)):${title}#Type]`;
                    break;
                case "parent":
                case "related":
                case "dimensions":
                case "staticdimensions":
                case "down":
                    inputString = `INPUT[inlineListSuggester(optionQuery("Database Editor/Database"), useLinks(partial)):${title}#${line}]`;
                    break;
                default:
                    inputString = `INPUT[text:${title}#${line}]`;
            }
            const div = container.createDiv();
            try {
                const inputField = mb.createInlineFieldFromString(inputString, page.file.path);
                mb.wrapInMDRC(inputField, div, comp);
                return div;
            } catch (error) {
                console.error(`Error creating input field for ${inputString}:`, error);
                div.textContent = `Error: ${error.message}`;
                return div;
            }
        });
        inputFieldsArr.push(titleInputs);
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
    inputFieldsArr.forEach((titleInputs, index) => {
        const inputRow = tableBody.createEl('tr');
        titleInputs.forEach((inputDiv, colIndex) => {
            const td = inputRow.createEl('td');
            td.appendChild(inputDiv);
        });

        const viewRow = tableBody.createEl('tr');
        lines.forEach((line, colIndex) => {
            const td = viewRow.createEl('td');
            const title = query[index].file.name;
            const viewString = `VIEW[{${title}#${line}}][text(renderMarkdown)]`;
            const viewDiv = container.createDiv();
            try {
                const viewField = mb.createInlineFieldFromString(viewString, currentFilePath);
                mb.wrapInMDRC(viewField, viewDiv, comp);
                td.appendChild(viewDiv);
            } catch (error) {
                console.error(`Error creating view field for ${viewString}:`, error);
                td.textContent = `Error: ${error.message}`;
            }
        });
    });

    new Notice("Table generated successfully");
    return table;
}

// Create a reactive component that listens to the locked toggle
const reactive = engine.reactive(async () => {
    await renderTable();
}, [
    mb.getMetadata(bindTargetLocked) // Only react to changes in the locked state
]);

// Subscribe to metadata changes for the locked state
mb.subscribeToMetadata(bindTargetLocked, component, () => reactive.refresh());

// Initial render
renderTable();


```
