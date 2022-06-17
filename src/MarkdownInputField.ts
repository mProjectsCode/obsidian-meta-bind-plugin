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

	arguments: { name: string, value: any }[];

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

		const declarationRegExp: RegExp = new RegExp(/\[.*?\]/);
		let declaration: string = declarationRegExp.exec(fullDeclaration)[0];
		declaration = declaration.replace('[', '').replace(']', '');
		let declarationParts: string[] = declaration.split(':');
		let boundTo: string = declarationParts[1] ?? '';

		this.isBound = !!boundTo;
		let inputFieldTypeWithArguments: string = declarationParts[0];
		const inputFieldArgumentsRegExp: RegExp = new RegExp(/\(.*\)/);
		this.inputFieldType = inputFieldTypeWithArguments.replace(inputFieldArgumentsRegExp, '');

		this.arguments = [];
		let inputFieldArgumentsRegExpResult = inputFieldArgumentsRegExp.exec(inputFieldTypeWithArguments);
		let inputFieldArgumentsString = inputFieldArgumentsRegExpResult ? inputFieldArgumentsRegExpResult[0] : '';
		console.log(inputFieldArgumentsString);
		if (inputFieldArgumentsString) {
			inputFieldArgumentsString = inputFieldArgumentsString.substring(1, inputFieldArgumentsString.length - 1);
			let inputFieldArguments: string[] = inputFieldArgumentsString.split(',');

			inputFieldArguments = inputFieldArguments.map(x => x.trim());
			for (const inputFieldArgument of inputFieldArguments) {
				if (inputFieldArgument.startsWith('class')) {
					let classArgumentsString: string = inputFieldArgumentsRegExp.exec(inputFieldArgument)[0];
					if (!classArgumentsString && classArgumentsString.length >= 2) {
						this.error = 'class needs an argument';
						return;
					}
					classArgumentsString = classArgumentsString.substring(1, classArgumentsString.length - 1);
					if (!classArgumentsString) {
						this.error = 'class argument can not be empty';
						return;
					}

					let inputFieldStyleArgument: { name: string, value: string } = {name: 'class', value: classArgumentsString};

					this.arguments.push(inputFieldStyleArgument);
				}

				if (inputFieldArgument.startsWith('addLabels')) {
					this.arguments.push({name: 'labels', value: true});
				}
			}
		}


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
		Logger.logDebug(this);

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

		let element: HTMLElement = null;

		if (this.inputFieldType === 'toggle') {
			const newEl = new ToggleComponent(container);
			newEl.setValue(this.getInitialValue());
			newEl.onChange(async (value) => {
				await this.updateMetaData(value);
			});
			this.inputElement = newEl;
			element = newEl.toggleEl;
		} else if (this.inputFieldType === 'slider') {
			let minValue = 0;
			let maxValue = 100;

			let labelArgument = this.arguments.filter(x => x.name === 'labels').first();
			if (labelArgument && labelArgument.value === true) {
				container.createSpan({text: minValue.toString()});
			}

			const newEl = new SliderComponent(container);
			newEl.setValue(this.getInitialValue());
			newEl.onChange(async (value) => {
				await this.updateMetaData(value);
			});
			newEl.setDynamicTooltip();

			if (labelArgument && labelArgument.value === true) {
				container.createSpan({text: maxValue.toString()});
			}

			this.inputElement = newEl;
			element = newEl.sliderEl;
		} else if (this.inputFieldType === 'text') {
			const newEl = new TextComponent(container);
			newEl.setValue(this.getInitialValue());
			newEl.onChange(async (value) => {
				await this.updateMetaData(value);
			});
			this.inputElement = newEl;
			element = newEl.inputEl;
		}

		if (element) {
			for (const argument of this.arguments) {
				if (argument.name === 'class') {
					element.addClass(argument.value);
				}
			}
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
