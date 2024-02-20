import { AbstractMDRC } from 'packages/obsidian/src/renderChildren/AbstractMDRC';

export class ExcludedMDRC extends AbstractMDRC {
	public onload(): void {
		console.debug('meta-bind | ExcludedMDRC >> load', this);

		this.containerEl.empty();

		this.containerEl.createEl('span', {
			text: '[META_BIND] This folder has been excluded in the settings',
			cls: 'mb-error',
		});

		super.onload();
	}

	public onunload(): void {
		console.debug('meta-bind | ExcludedMDRC >> unload', this);

		super.onunload();
	}
}
