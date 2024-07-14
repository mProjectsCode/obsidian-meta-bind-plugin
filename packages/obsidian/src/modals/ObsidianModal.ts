import { Modal } from 'obsidian';
import type { ModalOptions } from 'packages/core/src/api/InternalAPI';
import type { IModal } from 'packages/core/src/modals/IModal';
import type { ModalContent } from 'packages/core/src/modals/ModalContent';
import { DomHelpers } from 'packages/core/src/utils/Utils';
import type MetaBindPlugin from 'packages/obsidian/src/main';

export class ObsidianModal extends Modal implements IModal {
	content: ModalContent;
	options: ModalOptions | undefined;

	constructor(plugin: MetaBindPlugin, content: ModalContent, options?: ModalOptions) {
		super(plugin.app);

		this.content = content;
		content.setModal(this);
		this.options = options;
	}

	onOpen(): void {
		if (this.options?.title) {
			this.titleEl.setText(this.options.title);
		}

		if (this.options?.classes) {
			DomHelpers.addClasses(this.modalEl, this.options.classes);
		}

		this.content.mount(this.contentEl);
	}

	onClose(): void {
		this.content.unmount();
	}
}
