import { API } from 'packages/core/src/api/API';
import { RenderChildType } from 'packages/core/src/config/FieldConfigs';
import { InputFieldBase } from 'packages/core/src/fields/inputFields/InputFieldBase';
import { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { InputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { getUUID } from 'packages/core/src/utils/Utils';
import { TestPlugin } from './TestPlugin';

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
		const declaration: InputFieldDeclaration = this.inputFieldParser.fromStringAndValidate(
			fullDeclaration,
			filePath,
			scope,
		);

		return new InputFieldBase(this.plugin, getUUID(), filePath, renderType, declaration);
	}
}
