import { ViewFieldDeclaration, ViewFieldDeclarationParser } from '../parsers/ViewFieldDeclarationParser';
import { BindTargetParser } from '../parsers/BindTargetParser';
import { IPlugin } from '../IPlugin';
import { PublishInputFieldMDRC } from './PublishInputFieldMDRC';
import { PublishViewFieldMDRC } from './PublishViewFieldMDRC';
import { NewInputFieldDeclarationParser } from '../parsers/newInputFieldParser/InputFieldParser';
import { MarkdownPostProcessorContext } from 'obsidian/publish';
import { IAPI } from '../api/IAPI';
import { InputFieldAPI } from '../api/InputFieldAPI';
import { InputFieldDeclaration } from '../parsers/newInputFieldParser/InputFieldDeclaration';

export class PublishAPI implements IAPI {
	public readonly plugin: IPlugin;
	public readonly newInputFieldParser: NewInputFieldDeclarationParser;
	public readonly viewFieldParser: ViewFieldDeclarationParser;
	public readonly bindTargetParser: BindTargetParser;
	public readonly inputField: InputFieldAPI;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;

		this.newInputFieldParser = new NewInputFieldDeclarationParser(this.plugin);
		this.viewFieldParser = new ViewFieldDeclarationParser(this.plugin);
		this.bindTargetParser = new BindTargetParser(this.plugin);

		this.inputField = new InputFieldAPI(this);
	}

	public createInputFieldFromString(
		fullDeclaration: string,
		filePath: string,
		metadata: Record<string, any> | undefined,
		container: HTMLElement,
		component: MarkdownPostProcessorContext
	): PublishInputFieldMDRC {
		const declaration: InputFieldDeclaration = this.newInputFieldParser.parseString(fullDeclaration);

		const inputField = new PublishInputFieldMDRC(container, this, declaration, filePath, metadata, self.crypto.randomUUID());
		component.addChild(inputField);

		return inputField;
	}

	public createViewFieldFromString(
		fullDeclaration: string,
		filePath: string,
		metadata: Record<string, any> | undefined,
		container: HTMLElement,
		component: MarkdownPostProcessorContext
	): PublishViewFieldMDRC {
		const declaration: ViewFieldDeclaration = this.viewFieldParser.parseString(fullDeclaration);

		const viewField = new PublishViewFieldMDRC(container, this, declaration, filePath, metadata, self.crypto.randomUUID());
		component.addChild(viewField);

		return viewField;
	}
}
