import { MarkdownRenderChild, TFile } from 'obsidian';
import MetaBindPlugin from './main';
import { AbstractInputField } from './inputFields/AbstractInputField';
import { InputFieldFactory } from './inputFields/InputFieldFactory';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldType } from './parsers/InputFieldDeclarationParser';
import { AbstractInputFieldArgument } from './inputFieldArguments/AbstractInputFieldArgument';
import { ClassInputFieldArgument } from './inputFieldArguments/ClassInputFieldArgument';
import { MetaBindBindTargetError, MetaBindInternalError } from './utils/MetaBindErrors';
import { MetadataFileCache } from './MetadataManager';
import { parsePath, traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { ShowcaseInputFieldArgument } from './inputFieldArguments/ShowcaseInputFieldArgument';
import { TitleInputFieldArgument } from './inputFieldArguments/TitleInputFieldArgument';
import { isTruthy } from './utils/Utils';

export enum InputFieldMarkdownRenderChildType {
	INLINE_CODE_BLOCK,
	CODE_BLOCK,
}

export class InputFieldMarkdownRenderChild extends MarkdownRenderChild {
	plugin: MetaBindPlugin;
	metadataCache: MetadataFileCache | undefined;
	filePath: string;
	uuid: string;
	inputField: AbstractInputField | undefined;
	error: string;
	type: InputFieldMarkdownRenderChildType;

	fullDeclaration: string;
	inputFieldDeclaration: InputFieldDeclaration;
	bindTargetFile: TFile | undefined;
	bindTargetMetadataPath: string[] | undefined;

	intervalCounter: number;
	metadataValueUpdateQueue: any[];
	inputFieldValueUpdateQueue: any[];

	constructor(containerEl: HTMLElement, type: InputFieldMarkdownRenderChildType, declaration: InputFieldDeclaration, plugin: MetaBindPlugin, filePath: string, uuid: string) {
		super(containerEl);

		if (!declaration.error) {
			this.error = '';
		} else {
			this.error = declaration.error instanceof Error ? declaration.error.message : declaration.error;
		}

		this.filePath = filePath;
		this.uuid = uuid;
		this.plugin = plugin;
		this.type = type;
		this.fullDeclaration = declaration.fullDeclaration;

		this.metadataValueUpdateQueue = [];
		this.inputFieldValueUpdateQueue = [];
		this.intervalCounter = 0;
		this.inputFieldDeclaration = declaration;

		if (!this.error) {
			try {
				if (this.inputFieldDeclaration.isBound) {
					this.parseBindTarget();
				}

				this.inputField = InputFieldFactory.createInputField(this.inputFieldDeclaration.inputFieldType, {
					type: type,
					inputFieldMarkdownRenderChild: this,
					onValueChanged: this.updateMetadataManager.bind(this),
				});
			} catch (e: any) {
				this.error = e.message;
				console.warn(e);
			}
		}
	}

	parseBindTarget(): void {
		if (!this.inputFieldDeclaration) {
			throw new MetaBindInternalError('inputFieldDeclaration is undefined, can not parse bind target');
		}

		const bindTargetParts: string[] = this.inputFieldDeclaration.bindTarget.split('#');
		let bindTargetFileName: string;
		let bindTargetMetadataFieldName: string;

		if (bindTargetParts.length === 1) {
			// the bind target is in the same file
			bindTargetFileName = this.filePath;
			bindTargetMetadataFieldName = this.inputFieldDeclaration.bindTarget;
		} else if (bindTargetParts.length === 2) {
			// the bind target is in another file
			bindTargetFileName = bindTargetParts[0];
			bindTargetMetadataFieldName = bindTargetParts[1];
		} else {
			throw new MetaBindBindTargetError("bind target may only contain one '#' to specify the metadata field");
		}

		try {
			this.bindTargetMetadataPath = parsePath(bindTargetMetadataFieldName);
		} catch (e) {
			if (e instanceof Error) {
				throw new MetaBindBindTargetError(`bind target parsing error: ${e?.message}`);
			}
		}

		const files: TFile[] = this.plugin.getFilesByName(bindTargetFileName);
		if (files.length === 0) {
			throw new MetaBindBindTargetError('bind target file not found');
		} else if (files.length === 1) {
			this.bindTargetFile = files[0];
		} else {
			throw new MetaBindBindTargetError('bind target resolves to multiple files, please also specify the file path');
		}
	}

	registerSelfToMetadataManager(): MetadataFileCache | undefined {
		if (!this.inputFieldDeclaration?.isBound || !this.bindTargetFile || !this.bindTargetMetadataPath || this.bindTargetMetadataPath?.length === 0) {
			return;
		}

		return this.plugin.metadataManager.register(
			this.bindTargetFile,
			value => {
				if (!this.inputField) {
					throw new MetaBindInternalError('inputField is undefined, can not update inputField');
				}

				if (!this.inputField.isEqualValue(value)) {
					this.inputField.setValue(value);
				}
			},
			this.bindTargetMetadataPath,
			this.uuid
		);
	}

	unregisterSelfFromMetadataManager(): void {
		if (!this.inputFieldDeclaration?.isBound || !this.bindTargetFile || !this.bindTargetMetadataPath || this.bindTargetMetadataPath?.length === 0) {
			return;
		}

		this.plugin.metadataManager.unregister(this.bindTargetFile, this.uuid);
	}

	updateMetadataManager(value: any): void {
		if (!this.inputFieldDeclaration?.isBound || !this.bindTargetFile || !this.bindTargetMetadataPath || this.bindTargetMetadataPath?.length === 0) {
			return;
		}

		this.plugin.metadataManager.updatePropertyInMetadataFileCache(value, this.bindTargetMetadataPath, this.bindTargetFile, this.uuid);
	}

	getInitialValue(): any | undefined {
		if (this.inputFieldDeclaration?.isBound && this.bindTargetMetadataPath) {
			const value = traverseObjectByPath(this.bindTargetMetadataPath, this.metadataCache?.metadata);
			console.debug(`meta-bind | InputFieldMarkdownRenderChild >> setting initial value to ${value} (typeof ${typeof value}) for input field ${this.uuid}`);
			return value ?? this.inputField?.getDefaultValue();
		}
	}

	getArguments(name: InputFieldArgumentType): AbstractInputFieldArgument[] {
		if (this.inputFieldDeclaration.error) {
			throw new MetaBindInternalError('inputFieldDeclaration has errors, can not retrieve arguments');
		}

		return this.inputFieldDeclaration.argumentContainer.arguments.filter(x => x.identifier === name);
	}

	getArgument(name: InputFieldArgumentType): AbstractInputFieldArgument | undefined {
		return this.getArguments(name).at(0);
	}

	addCardContainer(): boolean {
		return (
			this.type === InputFieldMarkdownRenderChildType.CODE_BLOCK &&
			(isTruthy(this.getArgument(InputFieldArgumentType.SHOWCASE)) ||
				isTruthy(this.getArgument(InputFieldArgumentType.TITLE)) ||
				this.inputFieldDeclaration.inputFieldType === InputFieldType.SELECT ||
				this.inputFieldDeclaration.inputFieldType === InputFieldType.MULTI_SELECT)
		);
	}

	async onload(): Promise<void> {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> load', this);

		const container: HTMLDivElement = createDiv();
		container.addClass('meta-bind-plugin-input-wrapper');
		this.containerEl.addClass('meta-bind-plugin-input');

		if (this.error) {
			this.containerEl.empty();
			this.containerEl.createEl('span', { text: this.fullDeclaration, cls: 'meta-bind-code' });
			container.innerText = ` -> ERROR: ${this.error}`;
			container.addClass('meta-bind-plugin-error');
			this.containerEl.appendChild(container);
			return;
		}

		if (!this.inputField) {
			this.containerEl.empty();
			this.containerEl.createEl('span', { text: this.fullDeclaration, cls: 'meta-bind-code' });
			container.innerText = ` -> ERROR: ${new MetaBindInternalError('input field is undefined and error is empty').message}`;
			container.addClass('meta-bind-plugin-error');
			this.containerEl.appendChild(container);
			return;
		}

		this.metadataCache = this.registerSelfToMetadataManager();
		this.plugin.registerInputFieldMarkdownRenderChild(this);

		this.inputField.render(container);

		const classArguments: ClassInputFieldArgument[] = this.getArguments(InputFieldArgumentType.CLASS);
		if (classArguments) {
			this.inputField.getHtmlElement().addClasses(classArguments.map(x => x.value).flat());
		}

		this.containerEl.empty();

		const showcaseArgument: ShowcaseInputFieldArgument | undefined = this.getArgument(InputFieldArgumentType.SHOWCASE);
		const titleArgument: TitleInputFieldArgument | undefined = this.getArgument(InputFieldArgumentType.TITLE);

		if (this.addCardContainer()) {
			const cardContainer: HTMLDivElement = this.containerEl.createDiv({ cls: 'meta-bind-plugin-card' });

			if (titleArgument) {
				cardContainer.createEl('h3', { text: titleArgument.value });
			}

			cardContainer.appendChild(container);

			if (showcaseArgument) {
				cardContainer.createEl('code', { text: ` ${this.fullDeclaration} ` });
			}
		} else {
			this.containerEl.appendChild(container);
		}
	}

	onunload(): void {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> unload', this);

		this.inputField?.destroy();
		this.plugin.unregisterInputFieldMarkdownRenderChild(this);
		this.unregisterSelfFromMetadataManager();

		super.onunload();
	}
}
