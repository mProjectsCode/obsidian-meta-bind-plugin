import { IAPI } from '../../../src/api/IAPI';
import { IPlugin } from '../../../src/IPlugin';
import { BindTargetParser } from '../../../src/parsers/BindTargetParser';
import { InputFieldAPI } from '../../../src/api/InputFieldAPI';
import { InputFieldDeclarationParser } from '../../../src/parsers/inputFieldParser/InputFieldParser';
import { ViewFieldDeclarationParser } from '../../../src/parsers/ViewFieldDeclarationParser';

export class TestPlugin implements IPlugin {
	public api: TestAPI;

	constructor() {
		this.api = new TestAPI(this);
	}

	public getFilePathsByName(name: string): string[] {
		return [name];
	}
}

export class TestAPI implements IAPI {
	public readonly plugin: TestPlugin;

	public readonly bindTargetParser: BindTargetParser;
	public readonly inputFieldParser: InputFieldDeclarationParser;
	public readonly viewFieldParser: ViewFieldDeclarationParser;
	public readonly inputField: InputFieldAPI;

	constructor(plugin: TestPlugin) {
		this.plugin = plugin;

		this.inputFieldParser = new InputFieldDeclarationParser(this.plugin);
		this.viewFieldParser = new ViewFieldDeclarationParser(this.plugin);
		this.bindTargetParser = new BindTargetParser(this.plugin);

		this.inputField = new InputFieldAPI(this);
	}
}
