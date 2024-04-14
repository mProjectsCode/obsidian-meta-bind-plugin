import { API } from 'packages/core/src/api/API';
import { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
import { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { InputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { getUUID } from 'packages/core/src/utils/Utils';
import { TestPlugin } from './TestPlugin';
import { RenderChildType } from 'packages/core/src/config/APIConfigs';

export class TestAPI extends API<TestPlugin> {
	constructor(plugin: TestPlugin) {
		super(plugin);
	}
}
