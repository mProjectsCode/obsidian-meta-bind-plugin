import {MarkdownRenderChild, TFile} from 'obsidian';
import MetaBindPlugin from './main';
import {Logger} from './utils/Logger';
import {AbstractInputField} from './inputFields/AbstractInputField';
import {InputFieldFactory} from './inputFields/InputFieldFactory';
import {InputFieldDeclaration, InputFieldDeclarationParser} from './parsers/InputFieldDeclarationParser';
import {MetaBindBindTargetError} from './utils/Utils';

export enum InputFieldMarkdownRenderChildType {
	INLINE_CODE_BLOCK,
	CODE_BLOCK,
}

export class InputFieldMarkdownRenderChild extends MarkdownRenderChild {
	plugin: MetaBindPlugin;
	metaData: any;
	filePath: string;
	uid: number;
	inputField: AbstractInputField;
	error: string;

	inputFieldDeclaration: InputFieldDeclaration;
	bindTargetFile: TFile;
	bindTargetMetadataField: string;

	limitInterval: number;
	intervalCounter: number;
	valueQueue: any[];

	constructor(containerEl: HTMLElement, type: InputFieldMarkdownRenderChildType, fullDeclaration: string, plugin: MetaBindPlugin, filePath: string, uid: number) {
		super(containerEl);

		this.error = '';
		this.filePath = filePath;
		this.uid = uid;
		this.plugin = plugin;

		this.valueQueue = [];
		this.intervalCounter = 0;
		this.limitInterval = window.setInterval(() => this.applyValueQueueToMetadata(), this.plugin.settings.syncInterval);

		try {
			this.inputFieldDeclaration = InputFieldDeclarationParser.parse(fullDeclaration);

			if (this.inputFieldDeclaration.isBound) {
				this.parseBindTarget();
				this.metaData = this.plugin.getMetaDataForFile(this.bindTargetFile);
			}

			this.inputField = InputFieldFactory.createInputField(this.inputFieldDeclaration.inputFieldType, {
				type: type,
				inputFieldMarkdownRenderChild: this,
				onValueChanged: this.pushToValueQueue.bind(this),
			});
		} catch (e) {
			this.error = e.message;
			Logger.logWarning(e);
		}
	}

	parseBindTarget() {
		let bindTargetParts = this.inputFieldDeclaration.bindTarget.split('#');

		if (bindTargetParts.length === 1) {
			// the bind target is in the same file
			this.bindTargetMetadataField = this.inputFieldDeclaration.bindTarget;

			const files = this.plugin.getFilesByName(this.filePath);
			if (files.length === 0) {
				throw new MetaBindBindTargetError('bind target file not found');
			} else if (files.length === 1) {
				this.bindTargetFile = files[0];
			} else {
				throw new MetaBindBindTargetError('bind target resolves to multiple files; please also specify the file path');
			}
		} else if (bindTargetParts.length === 2) {
			// the bind target is in another file
			this.bindTargetMetadataField = bindTargetParts[1];

			const files = this.plugin.getFilesByName(bindTargetParts[0]);
			if (files.length === 0) {
				throw new MetaBindBindTargetError('bind target file not found');
			} else if (files.length === 1) {
				this.bindTargetFile = files[0];
			} else {
				throw new MetaBindBindTargetError('bind target resolves to multiple files; please also specify the file path');
			}
		} else {
			throw new MetaBindBindTargetError('bind target may only contain one \'#\' to specify the metadata field');
		}


	}

	// use this interval to reduce writing operations
	async applyValueQueueToMetadata() {
		if (this.valueQueue.length > 0) {
			// console.log(this.valueQueue.at(-1))
			await this.plugin.updateMetaData(this.bindTargetMetadataField, this.valueQueue.at(-1), this.bindTargetFile);
			this.valueQueue = [];
		}
	}

	async pushToValueQueue(value: any) {
		if (this.inputFieldDeclaration.isBound) {
			this.valueQueue.push(value);
		}
	}

	updateValue(value: any) {
		if (value == null) {
			value = this.inputField.getDefaultValue();
		}

		if (!this.inputField.isEqualValue(value) && this.valueQueue.length === 0) {
			Logger.logDebug(`updating input field ${this.uid} to`, value);
			this.inputField.setValue(value);
		}
	}

	getInitialValue() {
		// console.log(this);
		if (this.inputFieldDeclaration.isBound) {
			return this.metaData[this.bindTargetMetadataField] ?? this.inputField.getDefaultValue();
		}
	}

	getArguments(name: string) {
		return this.inputFieldDeclaration.arguments.filter(x => x.name === name);
	}

	getArgument(name: string) {
		return this.getArguments(name).first();
	}

	async onload() {
		Logger.logDebug('load', this);

		this.metaData = await this.metaData;

		const container: HTMLDivElement = this.containerEl.createDiv();
		container.addClass('meta-bind-plugin-input-wrapper');
		this.containerEl.addClass('meta-bind-plugin-input');

		if (this.error) {
			container.innerText = ` -> ERROR: ${this.error}`;
			container.addClass('meta-bind-plugin-error');
			this.containerEl.appendChild(container);
			return;
		}

		this.plugin.registerMarkdownInputField(this);

		this.inputField.render(container);

		const classArgument = this.getArguments('class');
		if (classArgument) {
			this.inputField.getHtmlElement().addClasses(classArgument.map(x => x.value));
		}


		this.containerEl.empty();
		this.containerEl.appendChild(container);
	}

	onunload() {
		Logger.logDebug('unload', this);

		this.plugin.unregisterMarkdownInputField(this);

		super.onunload();

		//console.log('unload', this);
		window.clearInterval(this.limitInterval);
	}
}
