import { MarkdownRenderChild, TFile } from 'obsidian';
import MetaBindPlugin from './main';
import { Logger } from './utils/Logger';
import { AbstractInputField } from './inputFields/AbstractInputField';
import { InputFieldFactory } from './inputFields/InputFieldFactory';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldDeclarationParser } from './parsers/InputFieldDeclarationParser';
import { MetaBindBindTargetError, MetaBindInternalError } from './utils/Utils';
import { AbstractInputFieldArgument } from './inputFieldArguments/AbstractInputFieldArgument';
import { ClassInputFieldArgument } from './inputFieldArguments/ClassInputFieldArgument';

export enum InputFieldMarkdownRenderChildType {
	INLINE_CODE_BLOCK,
	CODE_BLOCK,
}

export class InputFieldMarkdownRenderChild extends MarkdownRenderChild {
	plugin: MetaBindPlugin;
	metaData: any;
	filePath: string;
	uid: number;
	inputField: AbstractInputField | undefined;
	error: string;
	type: InputFieldMarkdownRenderChildType;

	fullDeclaration: string;
	inputFieldDeclaration: InputFieldDeclaration | undefined;
	bindTargetFile: TFile | undefined;
	bindTargetMetadataField: string | undefined;

	limitInterval: number | undefined;
	intervalCounter: number;
	metadataValueUpdateQueue: any[];
	inputFieldValueUpdateQueue: any[];

	constructor(containerEl: HTMLElement, type: InputFieldMarkdownRenderChildType, fullDeclaration: string, plugin: MetaBindPlugin, filePath: string, uid: number) {
		super(containerEl);

		this.error = '';
		this.filePath = filePath;
		this.uid = uid;
		this.plugin = plugin;
		this.type = type;
		this.fullDeclaration = fullDeclaration;

		this.metadataValueUpdateQueue = [];
		this.inputFieldValueUpdateQueue = [];
		this.intervalCounter = 0;

		try {
			this.inputFieldDeclaration = InputFieldDeclarationParser.parse(fullDeclaration);

			if (this.inputFieldDeclaration.isBound) {
				this.parseBindTarget();
				// @ts-ignore `parseBindTarget` sets `bindTargetFile` and `bindTargetMetadataField` or throws an error.
				this.metaData = this.plugin.getMetaDataForFile(this.bindTargetFile);
			}

			this.inputField = InputFieldFactory.createInputField(this.inputFieldDeclaration.inputFieldType, {
				type: type,
				inputFieldMarkdownRenderChild: this,
				onValueChanged: this.pushToMetadataValueUpdateQueue.bind(this),
			});

			this.limitInterval = window.setInterval(() => this.applyValueUpdateQueues(), this.plugin.settings.syncInterval);
		} catch (e: any) {
			this.error = e.message;
			console.warn(e);
		}
	}

	parseBindTarget(): void {
		if (!this.inputFieldDeclaration) {
			throw new MetaBindInternalError('inputFieldDeclaration is undefined, can not parse bind target');
		}

		const bindTargetParts = this.inputFieldDeclaration.bindTarget.split('#');

		if (bindTargetParts.length === 1) {
			// the bind target is in the same file
			this.bindTargetMetadataField = this.inputFieldDeclaration.bindTarget;

			const files: TFile[] = this.plugin.getFilesByName(this.filePath);
			if (files.length === 0) {
				throw new MetaBindBindTargetError('bind target file not found');
			} else if (files.length === 1) {
				this.bindTargetFile = files[0];
			} else {
				throw new MetaBindBindTargetError('bind target resolves to multiple files, please also specify the file path');
			}
		} else if (bindTargetParts.length === 2) {
			// the bind target is in another file
			this.bindTargetMetadataField = bindTargetParts[1];

			const files: TFile[] = this.plugin.getFilesByName(bindTargetParts[0]);
			if (files.length === 0) {
				throw new MetaBindBindTargetError('bind target file not found');
			} else if (files.length === 1) {
				this.bindTargetFile = files[0];
			} else {
				throw new MetaBindBindTargetError('bind target resolves to multiple files, please also specify the file path');
			}
		} else {
			throw new MetaBindBindTargetError("bind target may only contain one '#' to specify the metadata field");
		}
	}

	// use this interval to reduce writing operations
	async applyValueUpdateQueues(): Promise<void> {
		if (this.metadataValueUpdateQueue.length !== 0) {
			await this.applyMetadataValueUpdateQueue();
			this.cleanUpUpdateQueues();
			return;
		}

		if (this.inputFieldValueUpdateQueue.length !== 0) {
			await this.applyInputFieldValueUpdateQueue();
			this.cleanUpUpdateQueues();
			return;
		}
	}

	async applyMetadataValueUpdateQueue(): Promise<void> {
		if (!this.inputFieldDeclaration) {
			throw new MetaBindInternalError('inputFieldDeclaration is undefined, can not update metadata');
		}
		if (!this.inputFieldDeclaration.isBound) {
			return;
		}
		if (!this.bindTargetMetadataField || !this.bindTargetFile) {
			throw new MetaBindInternalError('bindTargetMetadataField or bindTargetFile is undefined, can not update metadata');
		}

		if (this.metadataValueUpdateQueue.length > 0) {
			await this.plugin.updateMetaData(this.bindTargetMetadataField, this.metadataValueUpdateQueue.at(-1), this.bindTargetFile);
		} else {
			throw new MetaBindInternalError(`cannot apply metadataValueUpdateQueue to inputField ${this.uid}, metadataValueUpdateQueue is empty`);
		}
	}

	async applyInputFieldValueUpdateQueue(): Promise<void> {
		if (!this.inputFieldDeclaration) {
			throw new MetaBindInternalError('inputFieldDeclaration is undefined, can not update inputField');
		}
		if (!this.inputField) {
			throw new MetaBindInternalError('inputField is undefined, can not update inputField');
		}

		if (this.inputFieldValueUpdateQueue.length > 0) {
			let value = this.inputFieldValueUpdateQueue.at(-1);

			if (value == null) {
				value = this.inputField.getDefaultValue();
			}

			Logger.logDebug(`updating input field ${this.uid} to`, value);
			this.inputField.setValue(value);
		} else {
			throw new MetaBindInternalError(`cannot apply inputFieldValueUpdateQueue to inputField ${this.uid}, inputFieldValueUpdateQueue is empty`);
		}
	}

	cleanUpUpdateQueues(): void {
		this.metadataValueUpdateQueue = [];
		this.inputFieldValueUpdateQueue = [];
	}

	pushToMetadataValueUpdateQueue(value: any): void {
		if (this.inputFieldDeclaration?.isBound) {
			this.metadataValueUpdateQueue.push(value);
		}
	}

	pushToInputFieldValueUpdateQueue(value: any): void {
		if (!this.inputField?.isEqualValue(value)) {
			this.inputFieldValueUpdateQueue.push(value);
		}
	}

	getInitialValue(): any | undefined {
		if (this.inputFieldDeclaration?.isBound) {
			return this.metaData[this.bindTargetMetadataField ?? ''] ?? this.inputField?.getDefaultValue();
		}
	}

	getArguments(name: InputFieldArgumentType): AbstractInputFieldArgument[] {
		if (!this.inputFieldDeclaration) {
			throw new MetaBindInternalError('inputFieldDeclaration is undefined, can not retrieve arguments');
		}

		return this.inputFieldDeclaration.argumentContainer.arguments.filter(x => x.identifier === name);
	}

	getArgument(name: InputFieldArgumentType): AbstractInputFieldArgument | undefined {
		return this.getArguments(name).at(0);
	}

	async onload(): Promise<void> {
		Logger.logDebug('load', this);

		this.metaData = await this.metaData;

		const container: HTMLDivElement = this.containerEl.createDiv();
		container.addClass('meta-bind-plugin-input-wrapper');
		this.containerEl.addClass('meta-bind-plugin-input');

		if (this.error) {
			this.containerEl.empty();
			const originalText = this.containerEl.createEl('span', { text: this.fullDeclaration, cls: 'meta-bind-code' });
			container.innerText = ` -> ERROR: ${this.error}`;
			container.addClass('meta-bind-plugin-error');
			this.containerEl.appendChild(container);
			return;
		}

		if (!this.inputField) {
			this.containerEl.empty();
			const originalText = this.containerEl.createEl('span', { text: this.fullDeclaration, cls: 'meta-bind-code' });
			container.innerText = ` -> ERROR: ${new MetaBindInternalError('input field is undefined and error is empty').message}`;
			container.addClass('meta-bind-plugin-error');
			this.containerEl.appendChild(container);
			return;
		}

		this.plugin.registerInputFieldMarkdownRenderChild(this);

		this.inputField.render(container);

		const classArguments: ClassInputFieldArgument[] = this.getArguments(InputFieldArgumentType.CLASS);
		if (classArguments) {
			this.inputField.getHtmlElement().addClasses(classArguments.map(x => x.value).flat());
		}

		this.containerEl.empty();
		this.containerEl.appendChild(container);
	}

	onunload(): void {
		Logger.logDebug('unload', this);

		this.plugin.unregisterInputFieldMarkdownRenderChild(this);

		super.onunload();

		//console.log('unload', this);
		window.clearInterval(this.limitInterval);
	}
}
