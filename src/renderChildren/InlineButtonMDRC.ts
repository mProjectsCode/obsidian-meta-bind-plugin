import { AbstractMDRC } from './AbstractMDRC';
import type MetaBindPlugin from '../main';
import { RenderChildType } from '../config/FieldConfigs';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import { InlineButtonField } from '../fields/button/InlineButtonField';

export class InlineButtonMDRC extends AbstractMDRC {
	content: string;
	buttonField?: InlineButtonField;

	constructor(containerEl: HTMLElement, content: string, plugin: MetaBindPlugin, filePath: string, uuid: string) {
		super(containerEl, RenderChildType.INLINE, plugin, filePath, uuid);
		this.content = content;
	}

	public onload(): void {
		console.log('meta-bind | InlineButtonMDRC >> onload');
		this.plugin.mdrcManager.registerMDRC(this);

		this.buttonField = new InlineButtonField(this.plugin, this.content, this.filePath);
		try {
			this.buttonField.mount(this.containerEl);
		} catch (e) {
			this.errorCollection.add(e);

			new ErrorIndicatorComponent({
				target: this.containerEl,
				props: {
					app: this.plugin.app,
					errorCollection: this.errorCollection,
					declaration: this.content,
				},
			});
		}
	}

	public onunload(): void {
		console.log('meta-bind | InlineButtonMDRC >> onunload');
		this.buttonField?.unmount();
		this.containerEl.empty();
		this.containerEl.addClass('mb-error');
		this.containerEl.innerText = 'unloaded meta bind button';
		this.plugin.mdrcManager.unregisterMDRC(this);
	}
}
