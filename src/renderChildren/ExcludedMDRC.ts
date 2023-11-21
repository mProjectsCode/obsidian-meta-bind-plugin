import { AbstractMDRC } from './AbstractMDRC';

export class ExcludedMDRC extends AbstractMDRC {
	public onload(): void {
		console.log('meta-bind | ExcludedMDRC >> load', this);

		this.containerEl.empty();

		this.containerEl.createEl('span', {
			text: '[META_BIND] This folder has been excluded in the settings',
			cls: 'mb-error',
		});
	}
}
