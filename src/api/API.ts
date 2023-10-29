import { InputFieldMDRC, RenderChildType } from '../renderChildren/InputFieldMDRC';
import { ViewFieldDeclarationParser } from '../parsers/viewFieldParser/ViewFieldDeclarationParser';
import { BindTargetParser } from '../parsers/BindTargetParser';
import { ViewFieldMDRC } from '../renderChildren/ViewFieldMDRC';
import { JsViewFieldMDRC } from '../renderChildren/JsViewFieldMDRC';
import type MetaBindPlugin from '../main';
import { InputFieldDeclarationParser } from '../parsers/inputFieldParser/InputFieldParser';
import { type Component, type MarkdownPostProcessorContext } from 'obsidian';
import { InputFieldAPI } from './InputFieldAPI';
import { type IAPI } from './IAPI';
import { ExcludedMDRC } from '../renderChildren/ExcludedMDRC';
import {
	type BindTargetDeclaration,
	type InputFieldDeclaration,
	type UnvalidatedInputFieldDeclaration,
} from '../parsers/inputFieldParser/InputFieldDeclaration';
import { Signal } from '../utils/Signal';
import { type BindTargetScope } from '../metadata/BindTargetScope';
import { MetaBindTable } from '../metaBindTable/MetaBindTable';
import { NewInputFieldFactory } from '../inputFields/NewInputFieldFactory';
import { type JsViewFieldDeclaration, type UnvalidatedViewFieldDeclaration, type ViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { ViewFieldFactory } from '../viewFields/ViewFieldFactory';

export class API implements IAPI {
	public plugin: MetaBindPlugin;
	public readonly inputField: InputFieldAPI;

	// public inputFieldParser: InputFieldDeclarationParser;
	public readonly inputFieldParser: InputFieldDeclarationParser;
	public readonly viewFieldParser: ViewFieldDeclarationParser;
	public readonly bindTargetParser: BindTargetParser;

	public readonly inputFieldFactory: NewInputFieldFactory;
	public readonly viewFieldFactory: ViewFieldFactory;

	constructor(plugin: MetaBindPlugin) {
		this.plugin = plugin;
		this.inputField = new InputFieldAPI(this);

		// this.inputFieldParser = new InputFieldDeclarationParser();
		this.inputFieldParser = new InputFieldDeclarationParser(this.plugin);
		this.viewFieldParser = new ViewFieldDeclarationParser(this.plugin);
		this.bindTargetParser = new BindTargetParser(this.plugin);

		this.inputFieldFactory = new NewInputFieldFactory(this.plugin);
		this.viewFieldFactory = new ViewFieldFactory(this.plugin);
	}

	public createInputField(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: Component | MarkdownPostProcessorContext,
	): InputFieldMDRC | ExcludedMDRC {
		if (this.plugin.isFilePathExcluded(filePath)) {
			return this.createExcludedField(containerEl, filePath, component);
		}

		const declaration = this.inputFieldParser.validateDeclaration(unvalidatedDeclaration);

		const inputField = new InputFieldMDRC(containerEl, renderType, declaration, this.plugin, filePath, self.crypto.randomUUID());
		component.addChild(inputField);

		return inputField;
	}

	public createInputFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: Component | MarkdownPostProcessorContext,
		scope: BindTargetScope | undefined,
	): InputFieldMDRC | ExcludedMDRC {
		if (this.plugin.isFilePathExcluded(filePath)) {
			return this.createExcludedField(containerEl, filePath, component);
		}

		const declaration: InputFieldDeclaration = this.inputFieldParser.parseString(fullDeclaration, scope);

		const inputField = new InputFieldMDRC(containerEl, renderType, declaration, this.plugin, filePath, self.crypto.randomUUID());
		component.addChild(inputField);

		return inputField;
	}

	public createViewFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: Component | MarkdownPostProcessorContext,
	): ViewFieldMDRC | ExcludedMDRC {
		if (this.plugin.isFilePathExcluded(filePath)) {
			return this.createExcludedField(containerEl, filePath, component);
		}

		const declaration: ViewFieldDeclaration = this.viewFieldParser.parseString(fullDeclaration);

		const viewField = new ViewFieldMDRC(containerEl, renderType, declaration, this.plugin, filePath, self.crypto.randomUUID());
		component.addChild(viewField);

		return viewField;
	}

	public createJsViewFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: Component | MarkdownPostProcessorContext,
	): JsViewFieldMDRC | ExcludedMDRC {
		if (this.plugin.isFilePathExcluded(filePath)) {
			return this.createExcludedField(containerEl, filePath, component);
		}

		const declaration: JsViewFieldDeclaration = this.viewFieldParser.parseJsString(fullDeclaration);

		const viewField = new JsViewFieldMDRC(containerEl, renderType, declaration, this.plugin, filePath, self.crypto.randomUUID());
		component.addChild(viewField);

		return viewField;
	}

	public createExcludedField(containerEl: HTMLElement, filePath: string, component: Component | MarkdownPostProcessorContext): ExcludedMDRC {
		const excludedField = new ExcludedMDRC(containerEl, RenderChildType.INLINE, this.plugin, filePath, self.crypto.randomUUID());
		component.addChild(excludedField);

		return excludedField;
	}

	public createSignal<T>(value: T): Signal<T> {
		return new Signal<T>(value);
	}

	/**
	 * Registers a signal to a metadata property and returns a callback to unregister.
	 *
	 * @param signal
	 * @param filePath
	 * @param metadataPath
	 * @param listenToChildren
	 */
	public listenToMetadata(signal: Signal<unknown>, filePath: string, metadataPath: string[], listenToChildren: boolean = false): () => void {
		const uuid = self.crypto.randomUUID();

		const subscription = this.plugin.metadataManager.subscribe(uuid, signal, {
			filePath: filePath,
			metadataPath: metadataPath,
			listenToChildren: listenToChildren,
			boundToLocalScope: false,
		});

		return () => {
			subscription.unsubscribe();
		};
	}

	public createTable(
		containerEl: HTMLElement,
		filePath: string,
		component: Component | MarkdownPostProcessorContext,
		bindTarget: BindTargetDeclaration,
		tableHead: string[],
		columns: (UnvalidatedInputFieldDeclaration | UnvalidatedViewFieldDeclaration)[],
	): MetaBindTable {
		const table = new MetaBindTable(containerEl, RenderChildType.INLINE, this.plugin, filePath, self.crypto.randomUUID(), bindTarget, tableHead, columns);
		component.addChild(table);

		return table;
	}

	public createBindTarget(fullDeclaration: string): BindTargetDeclaration {
		return this.bindTargetParser.parseAndValidateBindTarget(fullDeclaration);
	}
}
