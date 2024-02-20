import { type IPlugin } from 'packages/core/src/IPlugin';
import { type AbstractViewField } from 'packages/core/src/fields/viewFields/AbstractViewField';
import { MathVF } from 'packages/core/src/fields/viewFields/fields/MathVF';
import { TextVF } from 'packages/core/src/fields/viewFields/fields/TextVF';
import { ViewFieldType } from 'packages/core/src/config/FieldConfigs';
import { LinkVF } from 'packages/core/src/fields/viewFields/fields/LinkVF';
import { type ViewFieldBase } from 'packages/core/src/fields/viewFields/ViewFieldBase';

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
