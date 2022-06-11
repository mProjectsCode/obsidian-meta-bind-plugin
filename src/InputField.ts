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

	limitInterval: NodeJS.Timer;
	intervalCounter: number;
	valueQueue: any[];

	constructor(containerEl: HTMLElement, fullDeclaration: string, plugin: MetaBindPlugin, filePath: string) {
		super(containerEl);

		//console.log(this, 2)

		this.error = '';
		this.declaration = fullDeclaration;
		this.plugin = plugin;

		this.valueQueue = [];
		this.intervalCounter = 0;
		this.limitInterval = setInterval(this.incrementInterval.bind(this), 10);

		const regExp = new RegExp(/\[.*?\]/);
		let declaration = regExp.exec(fullDeclaration)[0];
		declaration = declaration.replace('[', '').replace(']', '');
		let declarationParts: string[] = declaration.split(':');
		let boundTo: string = declarationParts[1] ?? '';

		this.isBound = !!boundTo;
		this.inputFieldType = declarationParts[0].toLowerCase();

		if (this.isBound) {
			let boundToParts = boundTo.split('#');
			if (boundToParts.length === 1) { // same file
				this.boundMetadataField = boundTo;
				const files = plugin.getFilesByName(filePath);
				if (files.length === 0) {
					this.error = 'file not fond.';
					return;
				} else if (files.length === 1) {
					this.file = files[0];
				} else {
					this.error = 'multiple files found. please specify the file path.';
					return;
				}
			} else if (boundToParts.length === 2) {
				this.boundMetadataField = boundToParts[1];
				const files = plugin.getFilesByName(boundToParts[0]);
				if (files.length === 0) {
					this.error = 'file not fond.';
					return;
				} else if (files.length === 1) {
					this.file = files[0];
				} else {
					this.error = 'multiple files found. please specify the file path.';
					return;
				}
			} else {
				this.error = 'invalid binding.';
				return;
			}
			this.metaData = plugin.getMetaDataForFile(this.file);
		}

		// console.log(this, 3)
	}

	// use this interval to reduce writing operations
	async incrementInterval() {
		this.intervalCounter += 1;

		if (this.intervalCounter >= 20 && this.valueQueue.length > 0) {
			// console.log(this.valueQueue.at(-1))
			await this.plugin.updateMetaData(this.boundMetadataField, this.valueQueue.at(-1), this.file);
			this.valueQueue = [];
			this.intervalCounter = 0;
		}

	}

	async updateMetaData(value: any) {
		if (this.isBound) {
			this.valueQueue.push(value);
		}
	}

	getInitialValue() {
		console.log(this);
		if (this.isBound) {
			return this.metaData[this.boundMetadataField];
		}
	}

	onload() {
		//console.log('load', this);

		const container = this.containerEl.createDiv();
		container.addClass('meta-bind-plugin-input-wrapper');

		if (this.error) {
			container.innerText = `Error: ${this.error}`;
			container.addClass('meta-bind-plugin-error');
			this.containerEl.appendChild(container);
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

		this.containerEl.empty();
		this.containerEl.appendChild(container);
	}

	onunload() {
		super.onunload();

		//console.log('unload', this);
		clearInterval(this.limitInterval);
	}
}
