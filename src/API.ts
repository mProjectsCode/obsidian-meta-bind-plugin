import { App } from 'obsidian';
import MetaBindPlugin from './main';
import { InlineAPI } from './InlineAPI';
import { InputFieldMarkdownRenderChild, RenderChildType } from './InputFieldMarkdownRenderChild';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldDeclarationParser, InputFieldType } from './parsers/InputFieldDeclarationParser';
import { MetaBindBindTargetError, MetaBindParsingError } from './utils/MetaBindErrors';
import { isTruthy } from './utils/Utils';
import {ViewFieldDeclaration, ViewFieldDeclarationParser} from './parsers/ViewFieldDeclarationParser';
import {BindTargetParser} from './parsers/BindTargetParser';
import {ViewFieldMarkdownRenderChild} from './ViewFieldMarkdownRenderChild';

export class API {
	public app: App;
	public plugin: MetaBindPlugin;
	public inputFieldParser: InputFieldDeclarationParser;
	public viewFieldParser: ViewFieldDeclarationParser;
	public bindTargetParser: BindTargetParser;

	constructor(plugin: MetaBindPlugin) {
		this.plugin = plugin;

		this.app = plugin.app;
		this.inputFieldParser = new InputFieldDeclarationParser();
		this.viewFieldParser = new ViewFieldDeclarationParser();
		this.bindTargetParser = new BindTargetParser(this.plugin);
	}

	public createInlineAPI(filePath: string, container?: HTMLElement): InlineAPI {
		return new InlineAPI(this, filePath, container);
	}

	public createInputField(
		declaration: InputFieldDeclaration,
		templateName: string | undefined,
		renderChildType: RenderChildType,
		filePath: string,
		container: HTMLElement
	): InputFieldMarkdownRenderChild {
		if (!Object.values(RenderChildType).contains(renderChildType)) {
			throw new MetaBindParsingError(`unknown render child type '${renderChildType}'`);
		}
		declaration = this.inputFieldParser.parseDeclaration(declaration, undefined, templateName);
		return new InputFieldMarkdownRenderChild(container, renderChildType, declaration, this.plugin, filePath, self.crypto.randomUUID());
	}

	public createInputFieldFromString(fullDeclaration: string, renderType: RenderChildType, filePath: string, container: HTMLElement): InputFieldMarkdownRenderChild {
		const declaration: InputFieldDeclaration = this.inputFieldParser.parseString(fullDeclaration);
		return new InputFieldMarkdownRenderChild(container, renderType, declaration, this.plugin, filePath, self.crypto.randomUUID());
	}

	public createViewFieldFromString(fullDeclaration: string, renderType: RenderChildType, filePath: string, container: HTMLElement): ViewFieldMarkdownRenderChild {
		const declaration: ViewFieldDeclaration = this.viewFieldParser.parseString(fullDeclaration);
		return new ViewFieldMarkdownRenderChild(container, renderType, declaration, this.plugin, filePath, self.crypto.randomUUID());
	}

	public createInputFieldDeclaration(inputFieldType: InputFieldType, inputFieldArguments?: { type: InputFieldArgumentType; value: string }[]): InputFieldDeclaration {
		if (this.inputFieldParser.getInputFieldType(inputFieldType) === InputFieldType.INVALID) {
			throw new MetaBindParsingError(`input field type '${inputFieldType}' is invalid`);
		}

		return {
			declaration: undefined,
			fullDeclaration: undefined,
			inputFieldType: inputFieldType,
			argumentContainer: this.inputFieldParser.parseArguments(inputFieldType, inputFieldArguments),
			isBound: false,
			bindTarget: '',
			error: undefined,
		} as InputFieldDeclaration;
	}

	public createInputFieldDeclarationFromString(fullDeclaration: string): InputFieldDeclaration {
		return this.inputFieldParser.parseString(fullDeclaration);
	}

	public bindInputFieldDeclaration(declaration: InputFieldDeclaration, bindTargetField: string, bindTargetFile?: string): InputFieldDeclaration {
		if (bindTargetFile && !bindTargetField) {
			throw new MetaBindBindTargetError('if a bind target file is specified, a bind target field must also be specified');
		}

		declaration.isBound = isTruthy(bindTargetField);
		declaration.bindTarget = bindTargetFile ? bindTargetFile + '#' + bindTargetField : bindTargetField;

		return declaration;
	}
}
