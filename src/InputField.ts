import {MarkdownRenderChild, SliderComponent, TextComponent, ToggleComponent} from 'obsidian';
import MetaBindPlugin from './main';

export class InputField extends MarkdownRenderChild {
	text: string;
	fieldName: string;
	type: string;
	plugin: MetaBindPlugin;
	metaData: any;
	filePath: string;

	constructor(containerEl: HTMLElement, text: string, plugin: MetaBindPlugin, metaData: any, filePath: string) {
		super(containerEl);

		const regExp = new RegExp(/\[.*?\]/);
		let a = regExp.exec(text)[0];
		a = a.replace('[', '').replace(']', '');

		let aParts = a.split(':');

		this.text = text;
		this.type = aParts[0].toLowerCase();
		this.fieldName = aParts[1] ?? '';
		this.plugin = plugin;
		this.metaData = metaData;
		this.filePath = filePath;
	}

	onload() {
		console.log(this);

		const container = this.containerEl.createDiv();
		container.addClass('meta-bind-plugin-input-wrapper');

		if (this.type === 'toggle') {
			const newEl = new ToggleComponent(container);
			newEl.setValue(this.metaData[this.fieldName]);
			newEl.onChange(async (value) => {
				await this.plugin.updateMetaData(this.fieldName, value, this.filePath);
			});
		} else if (this.type === 'slider') {
			const newEl = new SliderComponent(container);
			newEl.setValue(this.metaData[this.fieldName]);
			newEl.onChange(async (value) => {
				await this.plugin.updateMetaData(this.fieldName, value, this.filePath);
			});
		} else if (this.type === 'text') {
			const newEl = new TextComponent(container);
			newEl.setValue(this.metaData[this.fieldName]);
			newEl.onChange(async (value) => {
				await this.plugin.updateMetaData(this.fieldName, value, this.filePath);
			});
		}

		this.containerEl.replaceWith(container);
	}
}
