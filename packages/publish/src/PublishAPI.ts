import { API, type FieldOptionMap, type FieldType, type InlineFieldType } from 'packages/core/src/api/API';
import type { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { PublishFieldMDRC } from 'packages/publish/src/PublishFieldMDRC';
import { type MetaBindPublishPlugin } from 'packages/publish/src/main';
import type { Component } from 'obsidian/publish';
import { type FieldBase } from 'packages/core/src/fields/FieldBase';

export interface ComponentLike {
	addChild(child: Component): void;
}

export class PublishAPI extends API<MetaBindPublishPlugin> {
	constructor(plugin: MetaBindPublishPlugin) {
		super(plugin);
	}

	public createMDRC<Type extends FieldType>(
		type: Type,
		options: FieldOptionMap[Type],
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
	): PublishFieldMDRC {
		const base = this.createField(type, filePath, options);

		return this.wrapInMDRC(base, containerEl, component);
	}

	public createInlineMDRCFromString(
		content: string,
		scope: BindTargetScope | undefined,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
	): PublishFieldMDRC {
		const base = this.createInlineFieldFromString(content, filePath, scope);

		return this.wrapInMDRC(base, containerEl, component);
	}

	public createInlineMDRCOfTypeFromString(
		type: InlineFieldType,
		content: string,
		scope: BindTargetScope | undefined,
		filePath: string,
		containerEl: HTMLElement,
		component: ComponentLike,
	): PublishFieldMDRC {
		const base = this.createInlineFieldOfTypeFromString(type, content, filePath, scope);

		return this.wrapInMDRC(base, containerEl, component);
	}

	public wrapInMDRC(field: FieldBase, containerEl: HTMLElement, component: ComponentLike): PublishFieldMDRC {
		const mdrc = new PublishFieldMDRC(this.plugin, field, containerEl);
		component.addChild(mdrc);

		return mdrc;
	}
}
