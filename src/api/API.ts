import { InputFieldMDRC, RenderChildType } from '../renderChildren/InputFieldMDRC';
import { InputFieldDeclaration } from '../parsers/InputFieldDeclarationParser';
import { JsViewFieldDeclaration, ViewFieldDeclaration, ViewFieldDeclarationParser } from '../parsers/ViewFieldDeclarationParser';
import { BindTargetParser } from '../parsers/BindTargetParser';
import { ViewFieldMDRC } from '../renderChildren/ViewFieldMDRC';
import { JsViewFieldMDRC } from '../renderChildren/JsViewFieldMDRC';
import MetaBindPlugin from '../main';
import { NewInputFieldDeclarationParser } from '../parsers/newInputFieldParser/InputFieldParser';
import { Component, MarkdownPostProcessorContext } from 'obsidian';
import { InputFieldAPI } from './InputFieldAPI';
import { UnvalidatedInputFieldDeclaration } from '../parsers/newInputFieldParser/InputFieldDeclarationValidator';
import { IAPI } from './IAPI';

export class API implements IAPI {
	public plugin: MetaBindPlugin;
	// public inputFieldParser: InputFieldDeclarationParser;
	public newInputFieldParser: NewInputFieldDeclarationParser;
	public viewFieldParser: ViewFieldDeclarationParser;
	public bindTargetParser: BindTargetParser;

	public readonly inputField: InputFieldAPI;

	constructor(plugin: MetaBindPlugin) {
		this.plugin = plugin;

		// this.inputFieldParser = new InputFieldDeclarationParser();
		this.newInputFieldParser = new NewInputFieldDeclarationParser(this.plugin);
		this.viewFieldParser = new ViewFieldDeclarationParser(this.plugin);
		this.bindTargetParser = new BindTargetParser(this.plugin);

		this.inputField = new InputFieldAPI(this);
	}

	public createInputField(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: Component | MarkdownPostProcessorContext
	): InputFieldMDRC {
		const declaration = this.newInputFieldParser.validateDeclaration(unvalidatedDeclaration);

		const inputField = new InputFieldMDRC(containerEl, renderType, declaration, this.plugin, filePath, self.crypto.randomUUID());
		component.addChild(inputField);

		return inputField;
	}

	public createInputFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: Component | MarkdownPostProcessorContext
	): InputFieldMDRC {
		const declaration: InputFieldDeclaration = this.newInputFieldParser.parseString(fullDeclaration);

		const inputField = new InputFieldMDRC(containerEl, renderType, declaration, this.plugin, filePath, self.crypto.randomUUID());
		component.addChild(inputField);

		return inputField;
	}

	public createViewFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		container: HTMLElement,
		component: Component | MarkdownPostProcessorContext
	): ViewFieldMDRC {
		const declaration: ViewFieldDeclaration = this.viewFieldParser.parseString(fullDeclaration);

		const viewField = new ViewFieldMDRC(container, renderType, declaration, this.plugin, filePath, self.crypto.randomUUID());
		component.addChild(viewField);

		return viewField;
	}

	public createJsViewFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: Component | MarkdownPostProcessorContext
	): JsViewFieldMDRC {
		const declaration: JsViewFieldDeclaration = this.viewFieldParser.parseJsString(fullDeclaration);

		const viewField = new JsViewFieldMDRC(containerEl, renderType, declaration, this.plugin, filePath, self.crypto.randomUUID());
		component.addChild(viewField);

		return viewField;
	}
}
