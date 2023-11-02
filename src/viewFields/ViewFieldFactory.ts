import { type IPlugin } from '../IPlugin';
import { type ViewFieldMDRC } from '../renderChildren/ViewFieldMDRC';
import { type AbstractViewField } from './AbstractViewField';
import { MathVF } from './fields/MathVF';
import { TextVF } from './fields/TextVF';
import { ViewFieldType } from '../parsers/GeneralConfigs';

export class ViewFieldFactory {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	createViewField(type: ViewFieldType, renderChild: ViewFieldMDRC): AbstractViewField | undefined {
		// Skipped: Date, Time, Image Suggester

		if (type === ViewFieldType.MATH) {
			return new MathVF(renderChild);
		} else if (type === ViewFieldType.TEXT) {
			return new TextVF(renderChild);
		}

		return undefined;
	}
}
