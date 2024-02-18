import { API, type FieldType } from '../api/API';
import { type MetaBindPublishPlugin } from './Publish';
import { type RenderChildType } from '../config/FieldConfigs';
import type { BindTargetScope } from '../metadata/BindTargetScope';
import { type ComponentLike } from '../api/ObsidianAPI';
import { PublishFieldMDRC } from './PublishFieldMDRC';

export class PublishAPI extends API<MetaBindPublishPlugin> {
	constructor(plugin: MetaBindPublishPlugin) {
		super(plugin);
	}

	public createMDRC(
		type: FieldType,
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
		scope?: BindTargetScope | undefined,
	): PublishFieldMDRC {
		// if (this.plugin.isFilePathExcluded(filePath)) {
		// 	return this.createExcludedField(containerEl, filePath, component);
		// }

		const base = this.createField(type, filePath, renderType, fullDeclaration, scope);

		const mdrc = new PublishFieldMDRC(this.plugin, base, containerEl);
		component.addChild(mdrc);

		return mdrc;
	}
}
