import { type App, Modal } from 'obsidian';
import { type ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import ErrorCollectionComponent from 'packages/core/src/utils/errors/ErrorCollectionComponent.svelte';

export interface ErrorCollectionModalSettings {
	errorCollection: ErrorCollection;
	code?: string | undefined;
	text?: string | undefined;
	errorText?: string | undefined;
	warningText?: string | undefined;
}

export class ErrorCollectionViewModal extends Modal {
	settings: ErrorCollectionModalSettings;
	component?: ErrorCollectionComponent;

	constructor(app: App, settings: ErrorCollectionModalSettings) {
		super(app);
		this.settings = settings;
	}

	public onOpen(): void {
		this.modalEl.addClass('mb-error-collection-modal', 'markdown-rendered');
		this.titleEl.innerText = 'Meta Bind Error Overview';

		this.component = new ErrorCollectionComponent({
			target: this.contentEl,
			props: {
				settings: this.settings,
			},
		});
	}

	public onClose(): void {
		this.component?.$destroy();
	}
}
