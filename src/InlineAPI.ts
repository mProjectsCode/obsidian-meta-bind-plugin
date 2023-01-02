import { TFile } from 'obsidian';
import { API } from './API';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldType } from './parsers/InputFieldDeclarationParser';
import { InputFieldMarkdownRenderChild, InputFieldMarkdownRenderChildType } from './InputFieldMarkdownRenderChild';

export class InlineAPI {
	public api: API;
	public file: TFile;
	public container?: HTMLElement;

	constructor(api: API, file: TFile, container?: HTMLElement) {
		this.api = api;
		this.file = file;
		this.container = container;
	}

	public createInputField(declaration: InputFieldDeclaration, templateName: string | undefined, renderType: InputFieldMarkdownRenderChildType): InputFieldMarkdownRenderChild {
		if (!this.container) {
			throw new Error('inline API was instanced without a container, please use "createInputFieldInContainer"');
		}

		return this.api.createInputField(declaration, templateName, renderType, this.file.path, this.container);
	}

	public createInputFieldInContainer(
		declaration: InputFieldDeclaration,
		templateName: string | undefined,
		renderType: InputFieldMarkdownRenderChildType,
		container: HTMLElement
	): InputFieldMarkdownRenderChild {
		return this.api.createInputField(declaration, templateName, renderType, this.file.path, container);
	}

	public createInputFieldFromString(fullDeclaration: string, renderType: InputFieldMarkdownRenderChildType, filePath: string): InputFieldMarkdownRenderChild {
		if (!this.container) {
			throw new Error('inline API was instanced without a container, please use "createInputFieldFromStringInContainer"');
		}

		return this.api.createInputFieldFromString(fullDeclaration, renderType, filePath, this.container);
	}

	public createInputFieldFromStringInContainer(
		fullDeclaration: string,
		renderType: InputFieldMarkdownRenderChildType,
		filePath: string,
		container: HTMLElement
	): InputFieldMarkdownRenderChild {
		return this.api.createInputFieldFromString(fullDeclaration, renderType, filePath, container);
	}

	public createDeclaration(
		inputFieldType: InputFieldType,
		inputFieldArguments?: Record<InputFieldArgumentType, string>,
		bindTargetFile?: string,
		bindTargetField?: string
	): InputFieldDeclaration {
		return this.api.createDeclaration(inputFieldType, inputFieldArguments, bindTargetFile, bindTargetField);
	}

	public createDeclarationFromString(fullDeclaration: string): InputFieldDeclaration {
		return this.api.createDeclarationFromString(fullDeclaration);
	}
}
