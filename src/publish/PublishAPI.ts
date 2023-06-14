import { InputFieldDeclaration, InputFieldDeclarationParser } from '../parsers/InputFieldDeclarationParser';
import { ViewFieldDeclaration, ViewFieldDeclarationParser } from '../parsers/ViewFieldDeclarationParser';
import { BindTargetParser } from '../parsers/BindTargetParser';
import { IPlugin } from '../IPlugin';
import { PublishInputFieldMDRC } from './PublishInputFieldMDRC';
import { PublishViewFieldMDRC } from './PublishViewFieldMDRC';

export class PublishAPI {
	public plugin: IPlugin;
	public inputFieldParser: InputFieldDeclarationParser;
	public viewFieldParser: ViewFieldDeclarationParser;
	public bindTargetParser: BindTargetParser;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;

		this.inputFieldParser = new InputFieldDeclarationParser();
		this.viewFieldParser = new ViewFieldDeclarationParser();
		this.bindTargetParser = new BindTargetParser(this.plugin);
	}

	public createInputFieldFromString(fullDeclaration: string, filePath: string, metadata: Record<string, any> | undefined, container: HTMLElement): PublishInputFieldMDRC {
		const declaration: InputFieldDeclaration = this.inputFieldParser.parseString(fullDeclaration);
		return new PublishInputFieldMDRC(container, this, declaration, filePath, metadata, self.crypto.randomUUID());
	}

	public createViewFieldFromString(fullDeclaration: string, filePath: string, metadata: Record<string, any> | undefined, container: HTMLElement): PublishViewFieldMDRC {
		const declaration: ViewFieldDeclaration = this.viewFieldParser.parseString(fullDeclaration);
		return new PublishViewFieldMDRC(container, this, declaration, filePath, metadata, self.crypto.randomUUID());
	}
}
