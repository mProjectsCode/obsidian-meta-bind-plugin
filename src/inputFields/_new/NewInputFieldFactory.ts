import { InputFieldConfig, InputFieldConfigs, InputFieldType } from '../InputFieldConfigs';
import { InputFieldMDRC, RenderChildType } from '../../renderChildren/InputFieldMDRC';
import { ErrorLevel, MetaBindParsingError } from '../../utils/errors/MetaBindErrors';
import { IPlugin } from '../../IPlugin';
import { Toggle } from './fields/Toggle/Toggle';
import { Text } from './fields/Text/Text';
import { Slider } from './fields/Slider/Slider';

export type NewInputField = Toggle | Slider | Text;

export class NewInputFieldFactory {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	createInputField(type: InputFieldType, renderChildType: RenderChildType, renderChild: InputFieldMDRC): NewInputField | undefined {
		if (type !== InputFieldType.INVALID) {
			this.checkRenderChildTypeAllowed(type, renderChildType);
		}

		if (type === InputFieldType.TOGGLE) {
			return new Toggle(renderChild);
		} else if (type === InputFieldType.SLIDER) {
			return new Slider(renderChild);
		} else if (type === InputFieldType.TEXT) {
			return new Text(renderChild);
		}

		return undefined;
	}

	checkRenderChildTypeAllowed(type: InputFieldType, renderChildType: RenderChildType): void {
		if (this.plugin.settings.ignoreCodeBlockRestrictions) {
			return;
		}

		const inputFieldConfig: InputFieldConfig = InputFieldConfigs[type];
		if (renderChildType === RenderChildType.BLOCK && !inputFieldConfig.allowInBlock) {
			throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'can not create input field', `'${type}' is not allowed as code block`);
		}
		if (renderChildType === RenderChildType.INLINE && !inputFieldConfig.allowInline) {
			throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'can not create input field', `'${type}' is not allowed as inline code block`);
		}
	}
}
