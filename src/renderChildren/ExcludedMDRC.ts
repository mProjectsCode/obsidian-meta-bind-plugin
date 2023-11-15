import { AbstractMDRC } from './AbstractMDRC';

export class ExcludedMDRC extends AbstractMDRC {
	public onload(): void {
		console.log('meta-bind | ExcludedMDRC >> load', this);

		this.containerEl.empty();

		this.containerEl.createEl('span', {
			text: 'this folder has been excluded in the meta bind plugin settings',
			cls: 'meta-bind-plugin-error',
		});
	}
}
