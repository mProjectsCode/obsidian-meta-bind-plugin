import { type Component } from 'obsidian';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import { V_API_createBindTarget, V_API_createTable, V_API_listenToMetadata } from 'packages/obsidian/src/APIValidators';
import {
	API,
	type FieldOptionMap,
	type FieldType,
	type InlineFieldType,
	isFieldTypeAllowedInline,
} from 'packages/core/src/api/API.js';
import { MetaBindTable } from 'packages/core/src/fields/metaBindTable/MetaBindTable';
import { type BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import {
	type BindTargetDeclaration,
	BindTargetStorageType,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { type UnvalidatedInputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { type UnvalidatedViewFieldDeclaration } from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { Signal } from 'packages/core/src/utils/Signal';
import { getUUID } from 'packages/core/src/utils/Utils';
import { validateArgs } from 'packages/core/src/utils/ZodUtils';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { parsePropPath } from 'packages/core/src/utils/prop/PropParser';
import { ObsidianButtonActionRunner } from 'packages/obsidian/src/ObsidianButtonActionRunner';
import { MarkdownRenderChildWidget } from 'packages/obsidian/src/cm6/Cm6_Widgets';
import { FieldMDRC } from 'packages/obsidian/src/renderChildren/FieldMDRC';
import { type FieldBase } from 'packages/core/src/fields/FieldBase';

export interface ComponentLike {
	addChild(child: Component): void;
}

export class ObsidianAPI extends API<MetaBindPlugin> {
	constructor(plugin: MetaBindPlugin) {
		super(plugin, {
			buttonActionRunner: new ObsidianButtonActionRunner(plugin),
		});
	}

	public createMDRC<Type extends FieldType>(
		type: Type,
		options: FieldOptionMap[Type],
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
	): FieldMDRC {
		const base = this.createField(type, filePath, options);

		return this.wrapInMDRC(base, containerEl, component);
	}

	public createInlineMDRCFromString(
		content: string,
		scope: BindTargetScope | undefined,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
	): FieldMDRC {
		const base = this.createInlineFieldFromString(content, filePath, scope);

		return this.wrapInMDRC(base, containerEl, component);
	}

	public createInlineMDRCOfTypeFromString(
		type: InlineFieldType,
		content: string,
		scope: BindTargetScope | undefined,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
	): FieldMDRC {
		const base = this.createInlineFieldOfTypeFromString(type, content, filePath, scope);

		return this.wrapInMDRC(base, containerEl, component);
	}

	public wrapInMDRC(field: FieldBase, containerEl: HTMLElement, component: ComponentLike): FieldMDRC {
		const mdrc = new FieldMDRC(this.plugin, field, containerEl);
		component.addChild(mdrc);

		return mdrc;
	}

	public createSignal<T>(value: T): Signal<T> {
		return new Signal<T>(value);
	}

	/**
	 * Registers a signal to a metadata property and returns a callback to unregister.
	 *
	 * @param signal a signal that will be updated with new metadata
	 * @param filePath the file path of the metadata to listen to
	 * @param metadataPath the object path of the metadata to listen to (e.g. ['task', '0', 'completed'])
	 * @param listenToChildren whether to listen to updates of the children of the metadata path, useful when listening to arrays or objects
	 * @param onDelete callback that will be called when the metadata becomes unavailable
	 */
	public listenToMetadata(
		signal: Signal<unknown>,
		filePath: string,
		metadataPath: string[],
		listenToChildren: boolean = false,
		onDelete?: () => void,
	): () => void {
		validateArgs(V_API_listenToMetadata, [signal, filePath, metadataPath, listenToChildren, onDelete]);

		const uuid = getUUID();

		const subscription = this.plugin.metadataManager.subscribe(
			uuid,
			signal,
			{
				storageType: BindTargetStorageType.FRONTMATTER,
				storagePath: filePath,
				storageProp: parsePropPath(metadataPath),
				listenToChildren: listenToChildren,
			},
			onDelete ?? ((): void => {}),
		);

		return () => {
			subscription.unsubscribe();
		};
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

	public createBindTarget(fullDeclaration: string, currentFilePath: string): BindTargetDeclaration {
		validateArgs(V_API_createBindTarget, [fullDeclaration, currentFilePath]);

		return this.bindTargetParser.fromStringAndValidate(fullDeclaration, currentFilePath);
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
