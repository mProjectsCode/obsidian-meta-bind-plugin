import { type FieldBase } from '../fields/IFieldBase';
import { PublishAbstractMDRC } from './PublishAbstractMDRC';
import { type MetaBindPublishPlugin } from './Publish';

export class PublishFieldMDRC extends PublishAbstractMDRC {
	readonly base: FieldBase;

	constructor(plugin: MetaBindPublishPlugin, base: FieldBase, containerEl: HTMLElement) {
		super(plugin, base.getFilePath(), containerEl);

		this.base = base;
	}

	onload(): void {
		this.base.mount(this.containerEl);

		super.onload();
	}

	onunload(): void {
		this.base.unmount();

		super.onunload();
	}
}
