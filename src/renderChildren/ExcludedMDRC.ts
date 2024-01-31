import { AbstractMDRC } from './AbstractMDRC';

export class ExcludedMDRC extends AbstractMDRC {
	public onload(): void {
		console.debug('meta-bind | ExcludedMDRC >> load', this);
		this.plugin.mdrcManager.registerMDRC(this);

		this.containerEl.empty();

		this.containerEl.createEl('span', {
			text: '[META_BIND] This folder has been excluded in the settings',
			cls: 'mb-error',
		});
	}

	public onunload(): void {
		console.debug('meta-bind | ExcludedMDRC >> unload', this);

		this.plugin.mdrcManager.unregisterMDRC(this);

		super.onunload();
	}
}
