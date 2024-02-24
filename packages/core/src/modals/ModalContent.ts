import { Mountable } from 'packages/core/src/utils/Mountable';
import { type IModal } from 'packages/core/src/modals/IModal';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';

export abstract class ModalContent extends Mountable {
	private modal: IModal | undefined;

	/**
	 * Set the modal reference that this content is displayed in.
	 *
	 * @param modal
	 */
	public setModal(modal: IModal): void {
		this.modal = modal;
	}

	/**
	 * Close the modal that this content is displayed in.
	 */
	public closeModal(): void {
		if (this.modal !== undefined) {
			this.modal.close();
		} else {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'Failed to close modal.',
				cause: 'Modal reference in ModalContent is undefined.',
			});
		}
	}
}
