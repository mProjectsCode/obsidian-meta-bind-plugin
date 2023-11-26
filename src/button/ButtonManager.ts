import { type ButtonConfig } from '../config/ButtonConfig';
import { getUUID } from '../utils/Utils';

export class ButtonManager {
	buttons: Map<string, Map<string, ButtonConfig>>;
	buttonLoadListeners: Map<string, Map<string, Map<string, (config: ButtonConfig) => void>>>;

	constructor() {
		this.buttons = new Map();
		this.buttonLoadListeners = new Map();
	}

	public registerButtonLoadListener(
		filePath: string,
		buttonId: string,
		callback: (config: ButtonConfig) => void,
	): () => void {
		const config = this.getButton(filePath, buttonId);
		if (config) {
			callback(config);
		}

		if (!this.buttonLoadListeners.has(filePath)) {
			this.buttonLoadListeners.set(filePath, new Map());
		}

		const fileButtonLoadListeners = this.buttonLoadListeners.get(filePath) as Map<
			string,
			Map<string, (config: ButtonConfig) => void>
		>;
		if (!fileButtonLoadListeners.has(buttonId)) {
			fileButtonLoadListeners.set(buttonId, new Map());
		}

		const buttonLoadListeners = fileButtonLoadListeners.get(buttonId) as Map<
			string,
			(config: ButtonConfig) => void
		>;
		const id = getUUID();
		buttonLoadListeners.set(id, callback);

		return () => this.removeButtonLoadListener(filePath, buttonId, id);
	}

	private notifyButtonLoadListeners(filePath: string, buttonId: string): void {
		const config = this.getButton(filePath, buttonId);
		if (!config) {
			throw new Error(`ButtonManager | button with id ${buttonId} does not exist`);
		}

		const fileButtonLoadListeners = this.buttonLoadListeners.get(filePath);
		if (!fileButtonLoadListeners) {
			return;
		}

		const buttonLoadListeners = fileButtonLoadListeners.get(buttonId);
		if (!buttonLoadListeners) {
			return;
		}

		for (const [_, fileButtonLoadListener] of buttonLoadListeners) {
			fileButtonLoadListener(config);
		}
	}

	private removeButtonLoadListener(filePath: string, buttonId: string, listenerId: string): void {
		const fileButtonLoadListeners = this.buttonLoadListeners.get(filePath);
		if (!fileButtonLoadListeners) {
			return;
		}

		const buttonLoadListeners = fileButtonLoadListeners.get(buttonId);
		if (!buttonLoadListeners) {
			return;
		}

		buttonLoadListeners.delete(listenerId);
		if (fileButtonLoadListeners.size === 0) {
			this.buttonLoadListeners.delete(filePath);
		}
	}

	public addButton(filePath: string, button: ButtonConfig): void {
		if (button.id === undefined) {
			throw new Error('ButtonManager | button id is undefined');
		}

		if (!this.buttons.has(filePath)) {
			this.buttons.set(filePath, new Map());
		}

		const fileButtons = this.buttons.get(filePath)!;

		fileButtons.set(button.id, button);
		this.notifyButtonLoadListeners(filePath, button.id);
	}

	public getButtons(filePath: string): Map<string, ButtonConfig> | undefined {
		return this.buttons.get(filePath);
	}

	public getButton(filePath: string, buttonId: string): ButtonConfig | undefined {
		const fileButtons = this.buttons.get(filePath);
		if (fileButtons) {
			return fileButtons.get(buttonId);
		}
		return undefined;
	}

	public removeButton(filePath: string, buttonId: string): void {
		const fileButtons = this.buttons.get(filePath);
		if (fileButtons) {
			fileButtons.delete(buttonId);

			if (fileButtons.size === 0) {
				this.buttons.delete(filePath);
			}
		}
	}
}
