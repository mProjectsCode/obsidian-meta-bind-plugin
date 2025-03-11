import type { Component } from 'obsidian/publish';
import { API } from 'packages/core/src/api/API';
import type { Mountable } from 'packages/core/src/utils/Mountable';
import type { PublishMetaBind, PublishComponents } from 'packages/publish/src/main';
import { PublishFieldMDRC } from 'packages/publish/src/PublishFieldMDRC';

export interface ComponentLike {
	addChild(child: Component): void;
}

export class PublishAPI extends API<PublishComponents> {
	private readonly pmb: PublishMetaBind;

	constructor(mb: PublishMetaBind) {
		super(mb);

		this.pmb = mb;
	}

	public wrapInMDRC(field: Mountable, containerEl: HTMLElement, component: ComponentLike): PublishFieldMDRC {
		const mdrc = new PublishFieldMDRC(this.pmb, field, containerEl);
		component.addChild(mdrc);

		return mdrc;
	}
}
