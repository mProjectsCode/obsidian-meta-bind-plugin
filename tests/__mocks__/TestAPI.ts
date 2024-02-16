import { API } from '../../src/api/API';
import { BindTargetParser } from '../../src/parsers/bindTargetParser/BindTargetParser';
import { InputFieldAPI } from '../../src/api/InputFieldAPI';
import { InputFieldDeclarationParser } from '../../src/parsers/inputFieldParser/InputFieldParser';
import { ViewFieldParser } from '../../src/parsers/viewFieldParser/ViewFieldParser';
import { InputFieldFactory } from '../../src/fields/inputFields/InputFieldFactory';
import { RenderChildType } from '../../src/config/FieldConfigs';
import { BindTargetScope } from '../../src/metadata/BindTargetScope';
import { InputFieldDeclaration } from '../../src/parsers/inputFieldParser/InputFieldDeclaration';
import { getUUID } from '../../src/utils/Utils';
import { ButtonActionRunner } from '../../src/fields/button/ButtonActionRunner';
import { TestPlugin } from './TestPlugin';
import { ButtonManager } from '../../src/fields/button/ButtonManager';
import { SyntaxHighlightingAPI } from '../../src/api/SyntaxHighlightingAPI';
import { ViewFieldFactory } from '../../src/fields/viewFields/ViewFieldFactory';
import { InputFieldBase } from '../../src/fields/inputFields/InputFieldBase';

export class TestAPI extends API<TestPlugin> {
	constructor(plugin: TestPlugin) {
		super(plugin);
	}

	public createInputFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		scope?: BindTargetScope | undefined,
	): InputFieldBase {
		const declaration: InputFieldDeclaration = this.inputFieldParser.parseString(fullDeclaration, filePath, scope);

		return new InputFieldBase(this.plugin, getUUID(), filePath, renderType, declaration);
	}
}
