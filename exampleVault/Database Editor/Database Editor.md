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

// Define the order of filters
const filterOrder = [
    "Display Table",
    "File Name",
    "Type",
    "File Class",
    "Parent",
    "Related",
    "Dimensions",
    "Static Dimensions"
];

// Extract unique options for each filter
const fileClassOptions = Array.from(new Set(dv.pages('"Database Editor/Database"').map(p => p.file.frontmatter.fileClass || '').filter(Boolean)));
const parentOptions = Array.from(new Set(dv.pages('"Database Editor/Database"').flatMap(p => p.file.frontmatter.parent || []).filter(Boolean)));
const TypeOptions = Array.from(new Set(dv.pages('"Database Editor/Database"').map(p => p.file.frontmatter.Type || '').filter(Boolean)));
const relatedOptions = Array.from(new Set(dv.pages('"Database Editor/Database"').flatMap(p => p.file.frontmatter.related || []).filter(Boolean)));
const dimensionsOptions = Array.from(new Set(dv.pages('"Database Editor/Database"').flatMap(p => p.file.frontmatter.dimensions || []).filter(Boolean)));
const staticdimensionsOptions = Array.from(new Set(dv.pages('"Database Editor/Database"').flatMap(p => p.file.frontmatter.staticdimensions || []).filter(Boolean)));

// Define bind targets for filters
const bindTargetFileName = mb.parseBindTarget('memory^fileNameFilter', currentFilePath);
const bindTargetLocked = mb.parseBindTarget('memory^locked', currentFilePath);
const bindTargetFileClass = mb.parseBindTarget('memory^fileClassFilter', currentFilePath);
const bindTargetParent = mb.parseBindTarget('memory^parentFilter', currentFilePath);
const bindTargetType = mb.parseBindTarget('memory^TypeFilter', currentFilePath);
const bindTargetRelated = mb.parseBindTarget('memory^relatedFilter', currentFilePath);
const bindTargetDimensions = mb.parseBindTarget('memory^dimensionsFilter', currentFilePath);
const bindTargetStaticDimensions = mb.parseBindTarget('memory^staticdimensionsFilter', currentFilePath);

// Define bind targets for inclusion filters
const bindTargetIncludedFileName = mb.parseBindTarget('memory^includedFileNameFilter', currentFilePath);
const bindTargetIncludedFileClass = mb.parseBindTarget('memory^includedFileClassFilter', currentFilePath);
const bindTargetIncludedParent = mb.parseBindTarget('memory^includedParentFilter', currentFilePath);
const bindTargetIncludedType = mb.parseBindTarget('memory^includedTypeFilter', currentFilePath);
const bindTargetIncludedRelated = mb.parseBindTarget('memory^includedRelatedFilter', currentFilePath);
const bindTargetIncludedDimensions = mb.parseBindTarget('memory^includedDimensionsFilter', currentFilePath);
const bindTargetIncludedStaticDimensions = mb.parseBindTarget('memory^includedStaticDimensionsFilter', currentFilePath);

// Define bind targets for excluded filters
const bindTargetExcludedFileName = mb.parseBindTarget('memory^excludedFileNameFilter', currentFilePath);
const bindTargetExcludedFileClass = mb.parseBindTarget('memory^excludedFileClassFilter', currentFilePath);
const bindTargetExcludedParent = mb.parseBindTarget('memory^excludedParentFilter', currentFilePath);
const bindTargetExcludedType = mb.parseBindTarget('memory^excludedTypeFilter', currentFilePath);
const bindTargetExcludedRelated = mb.parseBindTarget('memory^excludedRelatedFilter', currentFilePath);
const bindTargetExcludedDimensions = mb.parseBindTarget('memory^excludedDimensionsFilter', currentFilePath);
const bindTargetExcludedStaticDimensions = mb.parseBindTarget('memory^excludedStaticDimensionsFilter', currentFilePath);

// Table columns and lines
const columns = ["mathLink", "title", "Type", "parent", "related", "dimensions", "staticdimensions", "down", "Dimensions", "StaticDimensions","MKS", "CGS", "FPS", "Formula"];
const lines = ["mathLink", "title", "Type", "parent", "related", "dimensions", "staticdimensions", "down", "mathLink-blocks.Dimensions", "mathLink-blocks.StaticDimensions", "mathLink-blocks.MKS", "mathLink-blocks.CGS", "mathLink-blocks.FPS", "mathLink-blocks.Formula"];

// Create dropdown inputs
function createDropdown(id, options) {
    return `INPUT[inlineSelect(title(${id}), defaultValue(null), option(null), ${options.map(option => `option(${option})`).join(',')}):memory^${id}]`;
}

// Create list suggester input for included and excluded filters
function createListSuggester(id, options) {
    return `INPUT[inlineListSuggester(title(${id}), defaultValue(null), option(null),useLinks(false), ${options.map(option => `option(${option})`).join(',')}):memory^${id}]`;
}

// Render filters and table
async function renderTable() {
    comp.unload();
    comp.load();
    container.empty();

    // Create a wrapper div for both filters and table with always-visible scrolling
    const contentWrapper = container.createEl('div', { cls: 'content-wrapper' });
    contentWrapper.style.overflowX = 'scroll';
    contentWrapper.style.overflowY = 'auto';
    contentWrapper.style.width = '100%';
    contentWrapper.style.maxHeight = '80vh'; // Adjust this value as needed
    contentWrapper.style.border = '1px solid #ddd';

    // Check if the locked toggle is activated
    const isLocked = await mb.getMetadata(bindTargetLocked);

    // Define filter fields and labels
    const filterFields = [
        {
            label: "Display Table",
            field: `INPUT[toggle:memory^locked]`,
            includedField: null,
            excludedField: null
        },
        {
            label: "File Name",
            field: isLocked ? `VIEW[{memory^fileNameFilter}][text(renderMarkdown)]` : `INPUT[text(placeholder(File Name)):memory^fileNameFilter]`,
            includedField: isLocked ? `VIEW[{memory^includedFileNameFilter}][text(renderMarkdown)]` : createListSuggester('includedFileNameFilter', dv.pages('"Database Editor/Database"').map(p => p.file.name)),
            excludedField: isLocked ? `VIEW[{memory^excludedFileNameFilter}][text(renderMarkdown)]` : createListSuggester('excludedFileNameFilter', dv.pages('"Database Editor/Database"').map(p => p.file.name))
        },
        {
            label: "File Class",
            field: isLocked ? `VIEW[{memory^fileClassFilter}][text(renderMarkdown)]` : createDropdown('fileClassFilter', fileClassOptions),
            includedField: isLocked ? `VIEW[{memory^includedFileClassFilter}][text(renderMarkdown)]` : createListSuggester('includedFileClassFilter', fileClassOptions),
            excludedField: isLocked ? `VIEW[{memory^excludedFileClassFilter}][text(renderMarkdown)]` : createListSuggester('excludedFileClassFilter', fileClassOptions)
        },
        {
            label: "Parent",
            field: isLocked ? `VIEW[{memory^parentFilter}][text(renderMarkdown)]` : createDropdown('parentFilter', parentOptions),
            includedField: isLocked ? `VIEW[{memory^includedParentFilter}][text(renderMarkdown)]` : createListSuggester('includedParentFilter', parentOptions),
            excludedField: isLocked ? `VIEW[{memory^excludedParentFilter}][text(renderMarkdown)]` : createListSuggester('excludedParentFilter', parentOptions)
        },
        {
            label: "Type",
            field: isLocked ? `VIEW[{memory^TypeFilter}][text(renderMarkdown)]` : createDropdown('TypeFilter', TypeOptions),
            includedField: isLocked ? `VIEW[{memory^includedTypeFilter}][text(renderMarkdown)]` : createListSuggester('includedTypeFilter', TypeOptions),
            excludedField: isLocked ? `VIEW[{memory^excludedTypeFilter}][text(renderMarkdown)]` : createListSuggester('excludedTypeFilter', TypeOptions)
        },
        {
            label: "Related",
            field: isLocked ? `VIEW[{memory^relatedFilter}][text(renderMarkdown)]` : createDropdown('relatedFilter', relatedOptions),
            includedField: isLocked ? `VIEW[{memory^includedRelatedFilter}][text(renderMarkdown)]` : createListSuggester('includedRelatedFilter', relatedOptions),
            excludedField: isLocked ? `VIEW[{memory^excludedRelatedFilter}][text(renderMarkdown)]` : createListSuggester('excludedRelatedFilter', relatedOptions)
        },
        {
            label: "Dimensions",
            field: isLocked ? `VIEW[{memory^dimensionsFilter}][text(renderMarkdown)]` : createDropdown('dimensionsFilter', dimensionsOptions),
            includedField: isLocked ? `VIEW[{memory^includedDimensionsFilter}][text(renderMarkdown)]` : createListSuggester('includedDimensionsFilter', dimensionsOptions),
            excludedField: isLocked ? `VIEW[{memory^excludedDimensionsFilter}][text(renderMarkdown)]` : createListSuggester('excludedDimensionsFilter', dimensionsOptions)
        },
        {
            label: "Static Dimensions",
            field: isLocked ? `VIEW[{memory^staticdimensionsFilter}][text(renderMarkdown)]` : createDropdown('staticdimensionsFilter', staticdimensionsOptions),
            includedField: isLocked ? `VIEW[{memory^includedStaticDimensionsFilter}][text(renderMarkdown)]` : createListSuggester('includedStaticDimensionsFilter', staticdimensionsOptions),
            excludedField: isLocked ? `VIEW[{memory^excludedStaticDimensionsFilter}][text(renderMarkdown)]` : createListSuggester('excludedStaticDimensionsFilter', staticdimensionsOptions)
        }
    ];

    // Create a table for filters inside the content wrapper
    const filterTable = contentWrapper.createEl('table', { cls: 'filter-table' });
    filterTable.style.borderCollapse = 'collapse';
    filterTable.style.width = '100%';

    // Create filter rows
    const filterRow = filterTable.createEl('tr');
    const includedFilterRow = filterTable.createEl('tr');
    const excludedFilterRow = filterTable.createEl('tr');

    filterOrder.forEach(label => {
        const filterField = filterFields.find(f => f.label === label);
        if (filterField) {
            // Main filter
            const th = filterRow.createEl('th');
            th.textContent = filterField.label;
            th.style.fontWeight = 'bold';
            th.style.paddingRight = '10px';

            const td = filterRow.createEl('td');
            const renderedField = mb.createInlineFieldFromString(filterField.field, currentFilePath, undefined);
            mb.wrapInMDRC(renderedField, td, comp);

            // Included filter
            const includedTh = includedFilterRow.createEl('th');
            const includedTd = includedFilterRow.createEl('td');
            if (filterField.includedField) {
                includedTh.textContent = `Included ${filterField.label}`;
                includedTh.style.fontWeight = 'bold';
                includedTh.style.paddingRight = '10px';

                const renderedIncludedField = mb.createInlineFieldFromString(filterField.includedField, currentFilePath, undefined);
                mb.wrapInMDRC(renderedIncludedField, includedTd, comp);
            }

            // Excluded filter
            const excludedTh = excludedFilterRow.createEl('th');
            const excludedTd = excludedFilterRow.createEl('td');
            if (filterField.excludedField) {
                excludedTh.textContent = `Excluded ${filterField.label}`;
                excludedTh.style.fontWeight = 'bold';
                excludedTh.style.paddingRight = '10px';

                const renderedExcludedField = mb.createInlineFieldFromString(filterField.excludedField, currentFilePath, undefined);
                mb.wrapInMDRC(renderedExcludedField, excludedTd, comp);
            }
        }
    });

    if (!isLocked) {
        return; // Do not proceed with metadata retrieval or table rendering if not locked
    }

    // Get the filter values dynamically from memory
    const fileName = await mb.getMetadata(bindTargetFileName);
    const fileClass = await mb.getMetadata(bindTargetFileClass);
    const parent = await mb.getMetadata(bindTargetParent);
    const type = await mb.getMetadata(bindTargetType);
    const related = await mb.getMetadata(bindTargetRelated);
    const dimensions = await mb.getMetadata(bindTargetDimensions);
    const staticdimensions = await mb.getMetadata(bindTargetStaticDimensions);

    // Get the included filter values dynamically from memory
    const includedFileName = await mb.getMetadata(bindTargetIncludedFileName) || [];
    const includedFileClass = await mb.getMetadata(bindTargetIncludedFileClass) || [];
    const includedParent = await mb.getMetadata(bindTargetIncludedParent) || [];
    const includedType = await mb.getMetadata(bindTargetIncludedType) || [];
    const includedRelated = await mb.getMetadata(bindTargetIncludedRelated) || [];
    const includedDimensions = await mb.getMetadata(bindTargetIncludedDimensions) || [];
    const includedStaticDimensions = await mb.getMetadata(bindTargetIncludedStaticDimensions) || [];

    // Get the excluded filter values dynamically from memory
    const excludedFileName = await mb.getMetadata(bindTargetExcludedFileName) || [];
    const excludedFileClass = await mb.getMetadata(bindTargetExcludedFileClass) || [];
    const excludedParent = await mb.getMetadata(bindTargetExcludedParent) || [];
    const excludedType = await mb.getMetadata(bindTargetExcludedType) || [];
    const excludedRelated = await mb.getMetadata(bindTargetExcludedRelated) || [];
    const excludedDimensions = await mb.getMetadata(bindTargetExcludedDimensions) || [];
    const excludedStaticDimensions = await mb.getMetadata(bindTargetExcludedStaticDimensions) || [];

    // Perform query using filters, included filters, and excluded filters
    const query = dv.pages('"Database Editor/Database"')
        .where(p => (!fileName || p.file.name.toLowerCase().includes(fileName.toLowerCase())) &&
            (!fileClass || p.file.frontmatter.fileClass === fileClass) &&
            (!parent || (p.file.frontmatter.parent || []).includes(parent)) &&
            (!type || p.file.frontmatter.Type === type) &&
            (!related || (p.file.frontmatter.related || []).includes(related)) &&
            (!dimensions || (p.file.frontmatter.dimensions || []).includes(dimensions)) &&
            (!staticdimensions || (p.file.frontmatter.staticdimensions || []).includes(staticdimensions)) &&
            (!excludedFileName.includes(p.file.name)) &&
            (!excludedFileClass.includes(p.file.frontmatter.fileClass)) &&
            (!excludedParent.some(ep => (p.file.frontmatter.parent || []).includes(ep))) &&
            (!excludedType.includes(p.file.frontmatter.Type)) &&
            (!excludedRelated.some(er => (p.file.frontmatter.related || []).includes(er))) &&
            (!excludedDimensions.some(ed => (p.file.frontmatter.dimensions || []).includes(ed))) &&
            (!excludedStaticDimensions.some(esd => (p.file.frontmatter.staticdimensions || []).includes(esd))) &&
            (includedFileName.length === 0 || includedFileName.includes(p.file.name)) &&
            (includedFileClass.length === 0 || includedFileClass.includes(p.file.frontmatter.fileClass)) &&
            (includedParent.length === 0 || includedParent.some(ip => (p.file.frontmatter.parent || []).includes(ip))) &&
            (includedType.length === 0 || includedType.includes(p.file.frontmatter.Type)) &&
            (includedRelated.length === 0 || includedRelated.some(ir => (p.file.frontmatter.related || []).includes(ir))) &&
            (includedDimensions.length === 0 || includedDimensions.some(id => (p.file.frontmatter.dimensions || []).includes(id))) &&
            (includedStaticDimensions.length === 0 || includedStaticDimensions.some(isd => (p.file.frontmatter.staticdimensions || []).includes(isd)))
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
                    inputString = `INPUT[inlineSelect(option(Variable), option(Sub_Variable), option(Dimension), option(Sub_Dimension), option(Vocabulary), option(Math_Operation), option(Sub_Math_Operation), option(Equation), option(Constant), option(Concept), option(Folder)):${title}#Type]`;
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

    // Create table structure inside the content wrapper
    const table = contentWrapper.createEl('table', { cls: 'data-table' });
    table.style.borderCollapse = 'collapse';
    table.style.width = 'max-content';
    table.style.minWidth = '100%';

    const tableHead = table.createEl('thead');
    const headerRow = tableHead.createEl('tr');
    columns.forEach(column => {
        const th = headerRow.createEl('th');
        th.textContent = column;
        th.style.padding = '8px';
        th.style.borderBottom = '1px solid #ddd';
        th.style.whiteSpace = 'nowrap';
        th.style.backgroundColor = '#f2f2f2';
        th.style.position = 'sticky';
        th.style.top = '0';
        th.style.zIndex = '1';
    });
    const tableBody = table.createEl('tbody');

    // Populate table with views first and then input fields
    inputFieldsArr.forEach((titleInputs, index) => {
        // Create and append view row first
        const viewRow = tableBody.createEl('tr');
        lines.forEach((line, colIndex) => {
            const td = viewRow.createEl('td');
            td.style.padding = '8px';
            td.style.borderBottom = '1px solid #ddd';
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

        // Create and append input row after view row
        const inputRow = tableBody.createEl('tr');
        titleInputs.forEach((inputDiv, colIndex) => {
            const td = inputRow.createEl('td');
            td.style.padding = '8px';
            td.style.borderBottom = '1px solid #ddd';
            td.appendChild(inputDiv);
        });
    });

    new Notice("Table generated successfully");
    return contentWrapper;
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

// Add global CSS to the document
const style = document.createElement('style');
style.textContent = `
    .content-wrapper {
        overflow-x: scroll;
        overflow-y: auto;
        width: 100%;
        max-height: 80vh;
        border: 1px solid #ddd;
    }
    .content-wrapper table {
        border-collapse: collapse;
        width: max-content;
        min-width: 100%;
    }
    .content-wrapper th, .content-wrapper td {
        padding: 8px;
        border: 1px solid #ddd;
        white-space: nowrap;
    }
    .content-wrapper .data-table th {
        background-color: #f2f2f2;
        position: sticky;
        top: 0;
        z-index: 1;
    }
    .content-wrapper::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }
    .content-wrapper::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 5px;
    }
    .content-wrapper::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
    .content-wrapper::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
`;
document.head.appendChild(style);


```
