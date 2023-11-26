import { IAPI } from '../../src/api/IAPI';
import { BindTargetParser } from '../../src/parsers/BindTargetParser';
import { InputFieldAPI } from '../../src/api/InputFieldAPI';
import { InputFieldDeclarationParser } from '../../src/parsers/inputFieldParser/InputFieldParser';
import { ViewFieldParser } from '../../src/parsers/viewFieldParser/ViewFieldParser';
import { InputFieldFactory } from '../../src/fields/inputFields/InputFieldFactory';
import { RenderChildType } from '../../src/config/FieldConfigs';
import { BindTargetScope } from '../../src/metadata/BindTargetScope';
import { InputFieldDeclaration } from '../../src/parsers/inputFieldParser/InputFieldDeclaration';
import { getUUID } from '../../src/utils/Utils';
import { TestIPFBase } from './TestIPFBase';
import { ButtonActionRunner } from '../../src/button/ButtonActionRunner';
import { TestPlugin } from './TestPlugin';

export class TestAPI implements IAPI {
	public readonly plugin: TestPlugin;

	public readonly bindTargetParser: BindTargetParser;
	public readonly inputFieldParser: InputFieldDeclarationParser;
	public readonly viewFieldParser: ViewFieldParser;

	public readonly inputFieldFactory: InputFieldFactory;

	public readonly inputField: InputFieldAPI;

	public readonly buttonActionRunner: ButtonActionRunner;

	constructor(plugin: TestPlugin) {
		this.plugin = plugin;

		this.inputFieldParser = new InputFieldDeclarationParser(this.plugin);
		this.viewFieldParser = new ViewFieldParser(this.plugin);
		this.bindTargetParser = new BindTargetParser(this.plugin);

		this.inputFieldFactory = new InputFieldFactory(this.plugin);

		this.inputField = new InputFieldAPI(this);

		this.buttonActionRunner = new ButtonActionRunner(this.plugin);
	}

	public createInputFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		scope?: BindTargetScope | undefined,
	): TestIPFBase {
		const declaration: InputFieldDeclaration = this.inputFieldParser.parseString(fullDeclaration, scope);

		return new TestIPFBase(containerEl, renderType, declaration, this.plugin, filePath, getUUID());
	}
}
