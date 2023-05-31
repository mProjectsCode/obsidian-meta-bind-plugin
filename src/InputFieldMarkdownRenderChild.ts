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
import { Listener, Signal } from './utils/Signal';
import {BindTargetDeclaration} from './parsers/BindTargetParser';

export enum RenderChildType {
	INLINE = 'inline',
	BLOCK = 'block',
}

export class InputFieldMarkdownRenderChild extends MarkdownRenderChild {
	plugin: MetaBindPlugin;
	metadataCache: MetadataFileCache | undefined;
	filePath: string;
	uuid: string;
	inputField: AbstractInputField | undefined;
	error: string;
	renderChildType: RenderChildType;

	fullDeclaration?: string;
	inputFieldDeclaration: InputFieldDeclaration;
	bindTargetDeclaration?: BindTargetDeclaration;
	private metadataManagerReadSignalListener: Listener<any> | undefined;

	// maybe 2: in/out
	/**
	 * Signal to write to the input field
	 */
	public writeSignal: Signal<any>;
	/**
	 * Signal to read from the input field
	 */
	public readSignal: Signal<any>;

	constructor(containerEl: HTMLElement, renderChildType: RenderChildType, declaration: InputFieldDeclaration, plugin: MetaBindPlugin, filePath: string, uuid: string) {
		super(containerEl);

		if (!declaration.error) {
			this.error = '';
		} else {
			this.error = declaration.error instanceof Error ? declaration.error.message : declaration.error;
		}

		this.filePath = filePath;
		this.uuid = uuid;
		this.plugin = plugin;
		this.renderChildType = renderChildType;
		this.fullDeclaration = declaration.fullDeclaration;
		this.inputFieldDeclaration = declaration;

		this.writeSignal = new Signal<any>(undefined);
		this.readSignal = new Signal<any>(undefined);

		if (!this.error) {
			try {
				if (this.inputFieldDeclaration.isBound) {
					this.bindTargetDeclaration = this.plugin.api.bindTargetParser.parseBindTarget(this.inputFieldDeclaration.bindTarget, this.filePath);
				}

				this.inputField = InputFieldFactory.createInputField(this.inputFieldDeclaration.inputFieldType, {
					renderChildType: renderChildType,
					inputFieldMarkdownRenderChild: this,
				});
			} catch (e: any) {
				this.error = e.message;
				console.warn(e);
			}
		}
	}

	registerSelfToMetadataManager(): MetadataFileCache | undefined {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.bindTargetDeclaration) {
			return;
		}

		this.metadataManagerReadSignalListener = this.readSignal.registerListener({ callback: this.updateMetadataManager.bind(this) });

		return this.plugin.metadataManager.register(this.bindTargetDeclaration.file, this.writeSignal, this.bindTargetDeclaration.metadataPath, this.uuid);
	}

	unregisterSelfFromMetadataManager(): void {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.bindTargetDeclaration) {
			return;
		}

		if (this.metadataManagerReadSignalListener) {
			this.readSignal.unregisterListener(this.metadataManagerReadSignalListener);
		}

		this.plugin.metadataManager.unregister(this.bindTargetDeclaration.file, this.uuid);
	}

	updateMetadataManager(value: any): void {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.bindTargetDeclaration) {
			return;
		}

		this.plugin.metadataManager.updatePropertyInMetadataFileCache(value, this.bindTargetDeclaration.metadataPath, this.bindTargetDeclaration.file, this.uuid);
	}

	getInitialValue(): any | undefined {
		if (this.inputFieldDeclaration?.isBound && this.bindTargetDeclaration) {
			const value = traverseObjectByPath(this.bindTargetDeclaration.metadataPath, this.metadataCache?.metadata);
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
			this.renderChildType === RenderChildType.BLOCK &&
			(isTruthy(this.getArgument(InputFieldArgumentType.SHOWCASE)) ||
				isTruthy(this.getArgument(InputFieldArgumentType.TITLE)) ||
				this.inputFieldDeclaration.inputFieldType === InputFieldType.SELECT ||
				this.inputFieldDeclaration.inputFieldType === InputFieldType.MULTI_SELECT)
		);
	}

	hasValidBindTarget(): boolean {
		return isTruthy(this.inputFieldDeclaration?.isBound) && isTruthy(this.bindTargetDeclaration);
	}

	async onload(): Promise<void> {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('meta-bind-plugin-input');

		const container: HTMLDivElement = createDiv();
		container.addClass('meta-bind-plugin-input-wrapper');

		if (this.error) {
			this.renderError(this.error);
			return;
		}

		if (!this.inputField) {
			this.renderError(new MetaBindInternalError('input field is undefined and error is empty').message);
			return;
		}

		if (this.hasValidBindTarget()) {
			this.metadataCache = this.registerSelfToMetadataManager();
		}
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

	renderError(message: string): void {
		this.containerEl.empty();

		if (this.renderChildType === RenderChildType.BLOCK) {
			const cardContainer: HTMLDivElement = this.containerEl.createDiv({ cls: 'meta-bind-plugin-card' });

			cardContainer.createEl('code', { text: ` ${this.fullDeclaration} ` });
			cardContainer.createEl('span', { text: message, cls: 'meta-bind-plugin-error' });
		} else {
			this.containerEl.createEl('code', { text: ` ${this.fullDeclaration}` });
			this.containerEl.createEl('code', { text: `-> ${message}`, cls: 'meta-bind-plugin-error' });
		}
	}

	onunload(): void {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> unload', this);

		this.inputField?.destroy();
		this.plugin.unregisterInputFieldMarkdownRenderChild(this);
		this.unregisterSelfFromMetadataManager();

		this.containerEl.empty();
		this.containerEl.createEl('span', { text: 'unloaded meta bind input field', cls: 'meta-bind-plugin-error' });

		super.onunload();
	}
}
