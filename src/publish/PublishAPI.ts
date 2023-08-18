import { InputFieldDeclaration } from '../parsers/InputFieldDeclarationParser';
import { ViewFieldDeclaration, ViewFieldDeclarationParser } from '../parsers/ViewFieldDeclarationParser';
import { BindTargetParser } from '../parsers/BindTargetParser';
import { IPlugin } from '../IPlugin';
import { PublishInputFieldMDRC } from './PublishInputFieldMDRC';
import { PublishViewFieldMDRC } from './PublishViewFieldMDRC';
import { NewInputFieldDeclarationParser } from '../parsers/newInputFieldParser/InputFieldParser';
import { MarkdownPostProcessorContext } from 'obsidian/publish';

export class PublishAPI {
	public plugin: IPlugin;
	public newInputFieldParser: NewInputFieldDeclarationParser;
	public viewFieldParser: ViewFieldDeclarationParser;
	public bindTargetParser: BindTargetParser;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;

		this.newInputFieldParser = new NewInputFieldDeclarationParser(this.plugin);
		this.viewFieldParser = new ViewFieldDeclarationParser();
		this.bindTargetParser = new BindTargetParser(this.plugin);
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
