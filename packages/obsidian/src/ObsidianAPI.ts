import { type Component } from 'obsidian';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import { V_API_createTable } from 'packages/obsidian/src/APIValidators';
import { API, type FieldType, isFieldTypeAllowedInline } from 'packages/core/src/api/API.js';
import { MetaBindTable } from 'packages/core/src/fields/metaBindTable/MetaBindTable';
import { type BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { type UnvalidatedInputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { type UnvalidatedViewFieldDeclaration } from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { getUUID } from 'packages/core/src/utils/Utils';
import { validateArgs } from 'packages/core/src/utils/ZodUtils';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { MarkdownRenderChildWidget } from 'packages/obsidian/src/cm6/Cm6_Widgets';
import { FieldMDRC } from 'packages/obsidian/src/FieldMDRC';
import { type FieldBase } from 'packages/core/src/fields/FieldBase';

export interface ComponentLike {
	addChild(child: Component): void;
}

/**
 * Meta Bind API for Obsidian.
 * @extends API
 */
export class ObsidianAPI extends API<MetaBindPlugin> {
	constructor(plugin: MetaBindPlugin) {
		super(plugin);
	}

	public wrapInMDRC(field: FieldBase, containerEl: HTMLElement, component: ComponentLike): FieldMDRC {
		const mdrc = new FieldMDRC(this.plugin, field, containerEl);
		component.addChild(mdrc);

		return mdrc;
	}

	/**
	 * Creates an editable table.
	 *
	 * @param containerEl the container to mount the table to
	 * @param filePath the file path that the table is in or an empty string if it is not in a file
	 * @param component component for lifecycle management
	 * @param bindTarget the bind target of the table, it will be available to all input fields in the columns of the table as local scope
	 * @param tableHead the head of the table
	 * @param columns the columns of the table
	 */
	public createTable(
		containerEl: HTMLElement,
		filePath: string,
		component: ComponentLike,
		bindTarget: BindTargetDeclaration,
		tableHead: string[],
		columns: (UnvalidatedInputFieldDeclaration | UnvalidatedViewFieldDeclaration)[],
	): FieldMDRC {
		validateArgs(V_API_createTable, [containerEl, filePath, component, bindTarget, tableHead, columns]);

		const table = new MetaBindTable(this.plugin, getUUID(), filePath, bindTarget, tableHead, columns);
		const mdrc = new FieldMDRC(this.plugin, table, containerEl);
		component.addChild(mdrc);

		return mdrc;
	}

	/**
	 * Creates a MDRC widget from a given widget type.
	 *
	 * @param mdrcType
	 * @param content
	 * @param filePath
	 * @param component
	 */
	public constructMDRCWidget(
		mdrcType: FieldType,
		content: string,
		filePath: string,
		component: Component,
	): MarkdownRenderChildWidget {
		if (isFieldTypeAllowedInline(mdrcType)) {
			return new MarkdownRenderChildWidget(mdrcType, content, filePath, component, this.plugin);
		}

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to construct mdrc',
			cause: `Invalid inline mdrc type "${mdrcType}"`,
		});
	}
}
