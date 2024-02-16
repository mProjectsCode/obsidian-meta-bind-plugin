import { type IPlugin } from '../../IPlugin';
import { type AbstractViewField } from './AbstractViewField';
import { MathVF } from './fields/MathVF';
import { TextVF } from './fields/TextVF';
import { ViewFieldType } from '../../config/FieldConfigs';
import { LinkVF } from './fields/LinkVF';
import { type ViewFieldBase } from './ViewFieldBase';

export class ViewFieldFactory {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	createViewField(base: ViewFieldBase): AbstractViewField | undefined {
		// Skipped: Date, Time, Image Suggester

		const type = base.declaration.viewFieldType;

		if (type === ViewFieldType.MATH) {
			return new MathVF(base);
		} else if (type === ViewFieldType.TEXT) {
			return new TextVF(base);
		} else if (type === ViewFieldType.LINK) {
			return new LinkVF(base);
		}

		return undefined;
	}
}
