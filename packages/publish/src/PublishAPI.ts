import { API, type FieldType } from 'packages/core/src/api/API';
import { type RenderChildType } from 'packages/core/src/config/FieldConfigs';
import type { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { PublishFieldMDRC } from 'packages/publish/src/PublishFieldMDRC';
import { type MetaBindPublishPlugin } from 'packages/publish/src/main';
import type { Component } from 'obsidian/publish';

export interface ComponentLike {
	addChild(child: Component): void;
}

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
