import type MetaBindPlugin from 'packages/obsidian/src/main.ts';
import { type Component } from 'obsidian';
import { ExcludedMDRC } from 'packages/obsidian/src/renderChildren/ExcludedMDRC';

import {
	V_API_createBindTarget,
	V_API_createButtonFromString,
	V_API_createExcludedField,
	V_API_createInlineButtonFromString,
	V_API_createInputField,
	V_API_createInputFieldFromString,
	V_API_createJsViewFieldFromString,
	V_API_createTable,
	V_API_createViewFieldFromString,
	V_API_listenToMetadata,
} from 'packages/obsidian/src/APIValidators';

import { FieldMDRC } from 'packages/obsidian/src/renderChildren/FieldMDRC';
import { MarkdownRenderChildWidget } from 'packages/obsidian/src/cm6/Cm6_Widgets';
import { ObsidianButtonActionRunner } from 'packages/obsidian/src/ObsidianButtonActionRunner';
import { API, FieldType, isFieldTypeAllowedInline } from 'packages/core/src/api/API.js';
import { RenderChildType } from 'packages/core/src/config/FieldConfigs';
import { type BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { InputFieldBase } from 'packages/core/src/fields/inputFields/InputFieldBase';
import { validateArgs } from 'packages/core/src/utils/ZodUtils';
import { type UnvalidatedInputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { getUUID } from 'packages/core/src/utils/Utils';
import { Signal } from 'packages/core/src/utils/Signal';
import {
	type BindTargetDeclaration,
	BindTargetStorageType,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { parsePropPath } from 'packages/core/src/utils/prop/PropParser';
import { type UnvalidatedViewFieldDeclaration } from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { MetaBindTable } from 'packages/obsidian/src/metaBindTable/MetaBindTable';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';

export interface ComponentLike {
	addChild(child: Component): void;
}

export class ObsidianAPI extends API<MetaBindPlugin> {
	constructor(plugin: MetaBindPlugin) {
		super(plugin, {
			buttonActionRunner: new ObsidianButtonActionRunner(plugin),
		});
	}

	public createMDRC(
		type: FieldType,
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
		scope?: BindTargetScope | undefined,
	): FieldMDRC | ExcludedMDRC {
		if (this.plugin.isFilePathExcluded(filePath)) {
			return this.createExcludedField(containerEl, filePath, component);
		}

		const base = this.createField(type, filePath, renderType, fullDeclaration, scope);

		const mdrc = new FieldMDRC(this.plugin, base, containerEl);
		component.addChild(mdrc);

		return mdrc;
	}

	/**
	 * Creates an input field from an unvalidated declaration.
	 *
	 * @param unvalidatedDeclaration the unvalidated declaration
	 * @param renderType whether to render the input field inline or as a block
	 * @param filePath the file path that the input field is in or an empty string if it is not in a file
	 * @param containerEl the container to mount the input field to
	 * @param component component for lifecycle management
	 * @param scope optional bind target scope
	 */
	public createInputField(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
		scope?: BindTargetScope | undefined,
	): FieldMDRC | ExcludedMDRC {
		validateArgs(V_API_createInputField, [
			unvalidatedDeclaration,
			renderType,
			filePath,
			containerEl,
			component,
			scope,
		]);

		if (this.plugin.isFilePathExcluded(filePath)) {
			return this.createExcludedField(containerEl, filePath, component);
		}

		const declaration = this.inputFieldParser.validateDeclaration(unvalidatedDeclaration, filePath, scope);

		const base = new InputFieldBase(this.plugin, getUUID(), filePath, renderType, declaration);

		const inputField = new FieldMDRC(this.plugin, base, containerEl);
		component.addChild(inputField);

		return inputField;
	}

	/**
	 * Creates an input field from a string.
	 * This will parse the string and create the input field.
	 *
	 * @param fullDeclaration the string
	 * @param renderType whether to render the input field inline or as a block
	 * @param filePath the file path that the input field is in or an empty string if it is not in a file
	 * @param containerEl the container to mount the input field to
	 * @param component component for lifecycle management
	 * @param scope optional bind target scope
	 */
	public createInputFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
		scope?: BindTargetScope | undefined,
	): FieldMDRC | ExcludedMDRC {
		validateArgs(V_API_createInputFieldFromString, [
			fullDeclaration,
			renderType,
			filePath,
			containerEl,
			component,
			scope,
		]);

		return this.createMDRC(
			FieldType.INPUT_FIELD,
			fullDeclaration,
			renderType,
			filePath,
			containerEl,
			component,
			scope,
		);
	}

	/**
	 * Creates a view field from a string.
	 * This will parse the string and create the view field.
	 *
	 * @param fullDeclaration the string
	 * @param renderType whether to render the view field inline or as a block
	 * @param filePath the file path that the view field is in or an empty string if it is not in a file
	 * @param containerEl the container to mount the view field to
	 * @param component component for lifecycle management
	 * @param scope optional bind target scope
	 */
	public createViewFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
		scope?: BindTargetScope | undefined,
	): FieldMDRC | ExcludedMDRC {
		validateArgs(V_API_createViewFieldFromString, [
			fullDeclaration,
			renderType,
			filePath,
			containerEl,
			component,
			scope,
		]);

		return this.createMDRC(
			FieldType.VIEW_FIELD,
			fullDeclaration,
			renderType,
			filePath,
			containerEl,
			component,
			scope,
		);
	}

	/**
	 * Creates a js view field from a string.
	 * This will parse the string and create the js view field.
	 *
	 * @param fullDeclaration the string containing the header and the code
	 * @param renderType whether to render the js view field inline or as a block
	 * @param filePath the file path that the js view field is in or an empty string if it is not in a file
	 * @param containerEl the container to mount the js view field to
	 * @param component component for lifecycle management
	 */
	public createJsViewFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
	): FieldMDRC | ExcludedMDRC {
		validateArgs(V_API_createJsViewFieldFromString, [
			fullDeclaration,
			renderType,
			filePath,
			containerEl,
			component,
		]);

		return this.createMDRC(
			FieldType.JS_VIEW_FIELD,
			fullDeclaration,
			renderType,
			filePath,
			containerEl,
			component,
			undefined,
		);
	}

	public createButtonFromString(
		fullDeclaration: string,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
	): FieldMDRC | ExcludedMDRC {
		validateArgs(V_API_createButtonFromString, [fullDeclaration, filePath, containerEl, component]);

		return this.createMDRC(
			FieldType.BUTTON,
			fullDeclaration,
			RenderChildType.BLOCK,
			filePath,
			containerEl,
			component,
			undefined,
		);
	}

	public createInlineButtonFromString(
		fullDeclaration: string,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
	): FieldMDRC | ExcludedMDRC {
		validateArgs(V_API_createInlineButtonFromString, [fullDeclaration, filePath, containerEl, component]);

		return this.createMDRC(
			FieldType.INLINE_BUTTON,
			fullDeclaration,
			RenderChildType.INLINE,
			filePath,
			containerEl,
			component,
			undefined,
		);
	}

	/**
	 * An excluded field will render a message that the file was excluded in the plugin settings.
	 *
	 * @param containerEl the container to mount the field to
	 * @param filePath the file path that the field should be in or an empty string if it is not in a file
	 * @param component component for lifecycle management
	 */
	public createExcludedField(containerEl: HTMLElement, filePath: string, component: ComponentLike): ExcludedMDRC {
		validateArgs(V_API_createExcludedField, [containerEl, filePath, component]);

		const excludedField = new ExcludedMDRC(this.plugin, filePath, containerEl);
		component.addChild(excludedField);

		return excludedField;
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
	): MetaBindTable {
		validateArgs(V_API_createTable, [containerEl, filePath, component, bindTarget, tableHead, columns]);

		const table = new MetaBindTable(this.plugin, filePath, containerEl, bindTarget, tableHead, columns);
		component.addChild(table);

		return table;
	}

	public createBindTarget(fullDeclaration: string, currentFilePath: string): BindTargetDeclaration {
		validateArgs(V_API_createBindTarget, [fullDeclaration, currentFilePath]);

		return this.bindTargetParser.parseAndValidateBindTarget(fullDeclaration, currentFilePath);
	}

	/**
	 * Creates a MDRC widget from a given widget type.
	 *
	 * @param mdrcType
	 * @param content
	 * @param filePath
	 * @param component
	 * @param plugin
	 */
	public constructMDRCWidget(
		mdrcType: FieldType,
		content: string,
		filePath: string,
		component: Component,
		plugin: MetaBindPlugin,
	): MarkdownRenderChildWidget {
		if (isFieldTypeAllowedInline(mdrcType)) {
			return new MarkdownRenderChildWidget(mdrcType, content, filePath, component, plugin);
		}

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to construct mdrc',
			cause: `Invalid inline mdrc type "${mdrcType}"`,
		});
	}
}
