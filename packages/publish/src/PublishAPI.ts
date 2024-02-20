import { API, type FieldType } from 'packages/core/src/api/API';
import { type MetaBindPublishPlugin } from 'packages/publish/src/main';
import { type RenderChildType } from 'packages/core/src/config/FieldConfigs';
import type { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { type ComponentLike } from 'packages/obsidian/src/ObsidianAPI';
import { PublishFieldMDRC } from 'packages/publish/src/PublishFieldMDRC';

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
