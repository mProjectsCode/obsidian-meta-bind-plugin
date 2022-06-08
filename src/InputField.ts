import {MarkdownRenderChild, SliderComponent, TextComponent, TFile, ToggleComponent} from 'obsidian';
import MetaBindPlugin from './main';

export class InputField extends MarkdownRenderChild {
	plugin: MetaBindPlugin;
	metaData: any;
	error: string;

	declaration: string;
	inputFieldType: string;
	isBound: boolean;
	boundMetadataField: string;
	file: TFile;

	constructor(containerEl: HTMLElement, fullDeclaration: string, plugin: MetaBindPlugin, filePath: string) {
		super(containerEl);

		//console.log(this, 2)

		this.error = '';

		const regExp = new RegExp(/\[.*?\]/);
		let declaration = regExp.exec(fullDeclaration)[0];
		declaration = declaration.replace('[', '').replace(']', '');

		let declarationParts: string[] = declaration.split(':');
		let boundTo: string = declarationParts[1] ?? '';
		this.isBound = !!boundTo;
		if (this.isBound) {
			let boundToParts = boundTo.split('#');
			if (boundToParts.length === 1) { // same file
				this.boundMetadataField = boundTo;
				this.file = plugin.getFileByName(filePath);
			} else if (boundToParts.length === 2) {
				this.boundMetadataField = boundToParts[1];
				this.file = plugin.getFileByName(boundToParts[0]);
			} else {
				this.error = 'invalid binding';
			}

			this.metaData = plugin.getMetaDataForFile(this.file);
		}

		this.declaration = fullDeclaration;
		this.inputFieldType = declarationParts[0].toLowerCase();
		this.plugin = plugin;

		// console.log(this, 3)
	}

	async updateMetaData(value: any) {
		if (this.isBound) {
			await this.plugin.updateMetaData(this.boundMetadataField, value, this.file);
		}
	}

	getInitialValue() {
		if (this.isBound) {
			return this.metaData[this.boundMetadataField];
		}
	}

	onload() {
		//console.log(this, 1)

		const container = this.containerEl.createDiv();
		container.addClass('meta-bind-plugin-input-wrapper');

		if (this.error) {
			container.innerText = ` \`Error ${this.error}\``;
			this.containerEl.replaceWith(container);
			return;
		}

		if (this.inputFieldType === 'toggle') {
			const newEl = new ToggleComponent(container);
			newEl.setValue(this.getInitialValue());
			newEl.onChange(async (value) => {
				await this.updateMetaData(value);
			});
		} else if (this.inputFieldType === 'slider') {
			const newEl = new SliderComponent(container);
			newEl.setValue(this.getInitialValue());
			newEl.onChange(async (value) => {
				await this.updateMetaData(value);
			});
		} else if (this.inputFieldType === 'text') {
			const newEl = new TextComponent(container);
			newEl.setValue(this.getInitialValue());
			newEl.onChange(async (value) => {
				await this.updateMetaData(value);
			});
		}

		this.containerEl.replaceWith(container);
	}
}
