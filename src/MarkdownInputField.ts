import {MarkdownRenderChild, SliderComponent, TextComponent, TFile, ToggleComponent, ValueComponent} from 'obsidian';
import MetaBindPlugin from './main';
import {Logger} from './Logger';

export class MarkdownInputField extends MarkdownRenderChild {
	plugin: MetaBindPlugin;
	metaData: any;
	uid: number;
	inputElement: ValueComponent<any>;
	error: string;

	declaration: string;
	inputFieldType: string;
	isBound: boolean;
	boundMetadataField: string;
	file: TFile;

	limitInterval: number;
	intervalCounter: number;
	valueQueue: any[];

	constructor(containerEl: HTMLElement, fullDeclaration: string, plugin: MetaBindPlugin, filePath: string, uid: number) {
		super(containerEl);

		//console.log(this, 2)

		this.error = '';
		this.declaration = fullDeclaration;
		this.uid = uid;
		this.plugin = plugin;

		this.valueQueue = [];
		this.intervalCounter = 0;
		this.limitInterval = window.setInterval(this.incrementInterval.bind(this), 10);

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

	updateValue(value: any) {
		if (value != null && this.inputElement.getValue() !== value && this.valueQueue.length === 0) {
			Logger.logDebug(`updating input field ${this.uid} to '${value.toString()}'`);
			this.inputElement.setValue(value);
		}
	}

	getInitialValue() {
		// console.log(this);
		if (this.isBound) {
			return this.metaData[this.boundMetadataField];
		}
	}

	async onload() {
		//console.log('load', this);

		this.metaData = await this.metaData;

		const container = this.containerEl.createDiv();
		container.addClass('meta-bind-plugin-input-wrapper');

		if (this.error) {
			container.innerText = `Error: ${this.error}`;
			container.addClass('meta-bind-plugin-error');
			this.containerEl.appendChild(container);
			return;
		}

		this.plugin.registerMarkdownInputField(this);

		if (this.inputFieldType === 'toggle') {
			const newEl = new ToggleComponent(container);
			newEl.setValue(this.getInitialValue());
			newEl.onChange(async (value) => {
				await this.updateMetaData(value);
			});
			this.inputElement = newEl;
		} else if (this.inputFieldType === 'slider') {
			const newEl = new SliderComponent(container);
			newEl.setValue(this.getInitialValue());
			newEl.onChange(async (value) => {
				await this.updateMetaData(value);
			});
			newEl.setDynamicTooltip();
			this.inputElement = newEl;
		} else if (this.inputFieldType === 'text') {
			const newEl = new TextComponent(container);
			newEl.setValue(this.getInitialValue());
			newEl.onChange(async (value) => {
				await this.updateMetaData(value);
			});
			this.inputElement = newEl;
		}

		this.containerEl.empty();
		this.containerEl.appendChild(container);
	}

	onunload() {
		this.plugin.unregisterMarkdownInputField(this);

		super.onunload();

		//console.log('unload', this);
		window.clearInterval(this.limitInterval);
	}
}
