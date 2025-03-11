import type { MetaBind } from 'packages/core/src';
import { ViewFieldType } from 'packages/core/src/config/FieldConfigs';
import { ImageVF } from 'packages/core/src/fields/viewFields/fields/ImageVF';
import { LinkVF } from 'packages/core/src/fields/viewFields/fields/LinkVF';
import { MathVF } from 'packages/core/src/fields/viewFields/fields/MathVF';
import { TextVF } from 'packages/core/src/fields/viewFields/fields/TextVF';
import type { ViewFieldMountable } from 'packages/core/src/fields/viewFields/ViewFieldMountable';
import { expectType } from 'packages/core/src/utils/Utils';

export type ViewField = MathVF | TextVF | LinkVF | ImageVF;

export class ViewFieldFactory {
	mb: MetaBind;

	constructor(mb: MetaBind) {
		this.mb = mb;
	}

	createViewField(mountable: ViewFieldMountable): ViewField | undefined {
		// Skipped: Date, Time, Image Suggester

		const type = mountable.declaration.viewFieldType;

		if (type === ViewFieldType.MATH) {
			return new MathVF(mountable);
		} else if (type === ViewFieldType.TEXT) {
			return new TextVF(mountable);
		} else if (type === ViewFieldType.LINK) {
			return new LinkVF(mountable);
		} else if (type === ViewFieldType.IMAGE) {
			return new ImageVF(mountable);
		}

		expectType<ViewFieldType.INVALID>(type);

		return undefined;
	}
}
