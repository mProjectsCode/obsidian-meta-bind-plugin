import { API } from './API';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldType } from './parsers/InputFieldDeclarationParser';
import { InputFieldMDRC, RenderChildType } from './renderChildren/InputFieldMDRC';

export class InlineAPI {
	public api: API;
	public filePath: string;
	public container?: HTMLElement;

	constructor(api: API, filePath: string, container?: HTMLElement) {
		this.api = api;
		this.filePath = filePath;
		this.container = container;
	}

	public createInputField(declaration: InputFieldDeclaration, templateName: string | undefined, renderType: RenderChildType): InputFieldMDRC {
		if (!this.container) {
			throw new Error('inline API was instanced without a container, please use "createInputFieldInContainer"');
		}

		return this.api.createInputField(declaration, templateName, renderType, this.filePath, this.container);
	}

	public createInputFieldInContainer(
		declaration: InputFieldDeclaration,
		templateName: string | undefined,
		renderChildType: RenderChildType,
		container: HTMLElement
	): InputFieldMDRC {
		return this.api.createInputField(declaration, templateName, renderChildType, this.filePath, container);
	}

	public createInputFieldFromString(fullDeclaration: string, renderType: RenderChildType, filePath: string): InputFieldMDRC {
		if (!this.container) {
			throw new Error('inline API was instanced without a container, please use "createInputFieldFromStringInContainer"');
		}

		return this.api.createInputFieldFromString(fullDeclaration, renderType, filePath, this.container);
	}

	public createInputFieldFromStringInContainer(fullDeclaration: string, renderType: RenderChildType, filePath: string, container: HTMLElement): InputFieldMDRC {
		return this.api.createInputFieldFromString(fullDeclaration, renderType, filePath, container);
	}

	public createDeclaration(inputFieldType: InputFieldType, inputFieldArguments?: { type: InputFieldArgumentType; value: string }[]): InputFieldDeclaration {
		return this.api.createInputFieldDeclaration(inputFieldType, inputFieldArguments);
	}

	public createDeclarationFromString(fullDeclaration: string): InputFieldDeclaration {
		return this.api.createInputFieldDeclarationFromString(fullDeclaration);
	}

	public bindDeclaration(declaration: InputFieldDeclaration, bindTargetField: string, bindTargetFile?: string): InputFieldDeclaration {
		return this.api.bindInputFieldDeclaration(declaration, bindTargetField, bindTargetFile);
	}
}
