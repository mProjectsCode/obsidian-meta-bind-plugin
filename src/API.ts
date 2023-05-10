import { App } from 'obsidian';
import MetaBindPlugin from './main';
import { InlineAPI } from './InlineAPI';
import { InputFieldMarkdownRenderChild, RenderChildType } from './InputFieldMarkdownRenderChild';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldDeclarationParser, InputFieldType } from './parsers/InputFieldDeclarationParser';
import { MetaBindBindTargetError, MetaBindParsingError } from './utils/MetaBindErrors';
import { isTruthy } from './utils/Utils';

export class API {
	public app: App;
	public plugin: MetaBindPlugin;
	public parser: InputFieldDeclarationParser;

	constructor(plugin: MetaBindPlugin) {
		this.plugin = plugin;

		this.app = plugin.app;
		this.parser = new InputFieldDeclarationParser();
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
		declaration = this.parser.parseDeclaration(declaration, undefined, templateName);
		return new InputFieldMarkdownRenderChild(container, renderChildType, declaration, this.plugin, filePath, self.crypto.randomUUID());
	}

	public createInputFieldFromString(fullDeclaration: string, renderType: RenderChildType, filePath: string, container: HTMLElement): InputFieldMarkdownRenderChild {
		const declaration: InputFieldDeclaration = this.parser.parseString(fullDeclaration);
		return new InputFieldMarkdownRenderChild(container, renderType, declaration, this.plugin, filePath, self.crypto.randomUUID());
	}

	public createDeclaration(inputFieldType: InputFieldType, inputFieldArguments?: { type: InputFieldArgumentType; value: string }[]): InputFieldDeclaration {
		if (this.parser.getInputFieldType(inputFieldType) === InputFieldType.INVALID) {
			throw new MetaBindParsingError(`input field type '${inputFieldType}' is invalid`);
		}

		return {
			declaration: undefined,
			fullDeclaration: undefined,
			inputFieldType: inputFieldType,
			argumentContainer: this.parser.parseArguments(inputFieldType, inputFieldArguments),
			isBound: false,
			bindTarget: '',
			error: undefined,
		} as InputFieldDeclaration;
	}

	public createDeclarationFromString(fullDeclaration: string): InputFieldDeclaration {
		return this.parser.parseString(fullDeclaration);
	}

	public bindDeclaration(declaration: InputFieldDeclaration, bindTargetField: string, bindTargetFile?: string): InputFieldDeclaration {
		if (bindTargetFile && !bindTargetField) {
			throw new MetaBindBindTargetError('if a bind target file is specified, a bind target field must also be specified');
		}

		declaration.isBound = isTruthy(bindTargetField);
		declaration.bindTarget = bindTargetFile ? bindTargetFile + '#' + bindTargetField : bindTargetField;

		return declaration;
	}
}
