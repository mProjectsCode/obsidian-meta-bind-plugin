import { AbstractMDRC } from './AbstractMDRC';
import type MetaBindPlugin from '../main';
import { ButtonBase } from '../fields/button/ButtonBase';

export class ButtonMDRC extends AbstractMDRC {
	readonly base: ButtonBase;

	constructor(
		plugin: MetaBindPlugin,
		filePath: string,
		containerEl: HTMLElement,
		content: string,
		isPreview: boolean,
	) {
		super(plugin, filePath, containerEl);

		this.base = new ButtonBase(plugin, this.uuid, filePath, containerEl, content, isPreview);
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
