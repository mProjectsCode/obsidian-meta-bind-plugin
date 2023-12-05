import { type App, Modal, Setting } from 'obsidian';

export class TextPromptModal extends Modal {
	value: string;
	title: string;
	subTitle: string;
	description: string;

	onSubmit: (value: string) => void;
	onCancel: () => void;

	constructor(
		app: App,
		value: string,
		title: string,
		subTitle: string,
		description: string,
		onSubmit: (value: string) => void,
		onCancel: () => void,
	) {
		super(app);

		this.value = value;

		this.title = title;
		this.subTitle = subTitle;
		this.description = description;

		this.onSubmit = onSubmit;
		this.onCancel = onCancel;
	}

	public onOpen(): void {
		this.contentEl.empty();
		this.contentEl.createEl('h2', { text: this.title });

		const textSetting = new Setting(this.contentEl);
		textSetting.setName(this.subTitle);
		textSetting.setDesc(this.description);
		textSetting.addText(component => {
			component.setValue(this.value);
			component.setPlaceholder(this.subTitle);
			component.onChange(value => {
				this.value = value;
			});
		});

		const buttonSetting = new Setting(this.contentEl);
		buttonSetting.addButton(component => {
			component.setButtonText('Apply');
			component.setCta();
			component.onClick(() => {
				this.onSubmit(this.value);
				this.close();
			});
		});
		buttonSetting.addButton(component => {
			component.setButtonText('Cancel');
			component.onClick(() => {
				this.onCancel();
				this.close();
			});
		});
	}

	public onClose(): void {
		super.onClose();
	}
}
