import { App, Modal } from 'obsidian';
import { ErrorCollection } from './ErrorCollection';
import ErrorCollectionComponent from './ErrorCollectionComponent.svelte';

export class ErrorCollectionViewModal extends Modal {
	errorCollection: ErrorCollection;
	declaration: string;
	component?: ErrorCollectionComponent;

	constructor(app: App, errorCollection: ErrorCollection, declaration: string) {
		super(app);
		this.errorCollection = errorCollection;
		this.declaration = declaration;
	}

	public onOpen(): void {
		this.modalEl.addClass('mb-error-collection-modal');
		this.titleEl.innerText = 'Meta Bind Field';

		this.component = new ErrorCollectionComponent({
			target: this.contentEl,
			props: {
				errorCollection: this.errorCollection,
				declaration: this.declaration,
			},
		});
	}

	public onClose(): void {
		this.component?.$destroy();
	}
}
