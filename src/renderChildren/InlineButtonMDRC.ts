import { AbstractMDRC } from './AbstractMDRC';
import type MetaBindPlugin from '../main';
import { InlineButtonBase } from '../fields/button/InlineButtonBase';

export class InlineButtonMDRC extends AbstractMDRC {
	readonly base: InlineButtonBase;

	constructor(plugin: MetaBindPlugin, filePath: string, containerEl: HTMLElement, content: string) {
		super(plugin, filePath, containerEl);

		this.base = new InlineButtonBase(plugin, this.uuid, filePath, containerEl, content);
	}

	onload(): void {
		this.base.mount();

		super.onload();
	}

	onunload(): void {
		this.base.destroy();

		super.onunload();
	}
}
