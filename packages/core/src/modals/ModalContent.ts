import { Mountable } from 'packages/core/src/utils/Mountable';

export abstract class ModalContent extends Mountable {
	private closeModalCallback: (() => void) | undefined;

	public setCloseModalCallback(callback: () => void): void {
		this.closeModalCallback = callback;
	}

	public closeModal(): void {
		this.closeModalCallback?.();
	}
}
