import { AbstractInputField } from '../inputFields/AbstractInputField';
import { InputFieldFactory } from '../inputFields/InputFieldFactory';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldType } from '../parsers/InputFieldDeclarationParser';
import { AbstractInputFieldArgument } from '../inputFieldArguments/AbstractInputFieldArgument';
import { ClassInputFieldArgument } from '../inputFieldArguments/arguments/ClassInputFieldArgument';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { ShowcaseInputFieldArgument } from '../inputFieldArguments/arguments/ShowcaseInputFieldArgument';
import { TitleInputFieldArgument } from '../inputFieldArguments/arguments/TitleInputFieldArgument';
import { isTruthy, MBExtendedLiteral } from '../utils/Utils';
import { Listener, Signal } from '../utils/Signal';
import { AbstractMDRC } from './AbstractMDRC';
import { MetadataFileCache } from '../metadata/MetadataFileCache';
import MetaBindPlugin from '../main';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';

export enum RenderChildType {
	INLINE = 'inline',
	BLOCK = 'block',
}

export class InputFieldMDRC extends AbstractMDRC {
	metadataCache: MetadataFileCache | undefined;
	inputField: AbstractInputField<MBExtendedLiteral> | undefined;

	fullDeclaration?: string;
	inputFieldDeclaration: InputFieldDeclaration;

	private metadataManagerReadSignalListener: Listener<MBExtendedLiteral | undefined> | undefined;

	/**
	 * Signal to write to the input field
	 */
	public writeSignal: Signal<MBExtendedLiteral | undefined>;
	/**
	 * Signal to read from the input field
	 */
	public readSignal: Signal<MBExtendedLiteral | undefined>;

	constructor(
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: InputFieldDeclaration,
		plugin: MetaBindPlugin,
		filePath: string,
		uuid: string,
		frontmatter: any | null | undefined = undefined
	) {
		super(containerEl, renderChildType, plugin, filePath, uuid, frontmatter);

		this.errorCollection.merge(declaration.errorCollection);

		this.fullDeclaration = declaration.fullDeclaration;
		this.inputFieldDeclaration = declaration;

		this.writeSignal = new Signal<MBExtendedLiteral | undefined>(undefined);
		this.readSignal = new Signal<MBExtendedLiteral | undefined>(undefined);

		if (!this.errorCollection.hasErrors()) {
			try {
				this.inputField = InputFieldFactory.createInputField(this.inputFieldDeclaration.inputFieldType, {
					renderChildType: renderChildType,
					inputFieldMDRC: this,
				});
			} catch (e: any) {
				this.errorCollection.add(e);
			}
		}
	}

	registerSelfToMetadataManager(): MetadataFileCache | undefined {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.inputFieldDeclaration.bindTarget) {
			return;
		}

		this.metadataManagerReadSignalListener = this.readSignal.registerListener({ callback: this.updateMetadataManager.bind(this) });

		return this.plugin.metadataManager.register(
			this.inputFieldDeclaration.bindTarget.filePath ?? this.filePath,
			this.writeSignal,
			this.inputFieldDeclaration.bindTarget.metadataPath,
			this.uuid
		);
	}

	unregisterSelfFromMetadataManager(): void {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.inputFieldDeclaration.bindTarget) {
			return;
		}

		if (this.metadataManagerReadSignalListener) {
			this.readSignal.unregisterListener(this.metadataManagerReadSignalListener);
		}

		this.plugin.metadataManager.unregister(this.inputFieldDeclaration.bindTarget.filePath ?? this.filePath, this.uuid);
	}

	updateMetadataManager(value: unknown): void {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.inputFieldDeclaration.bindTarget) {
			return;
		}

		this.plugin.metadataManager.updatePropertyInCache(
			value,
			this.inputFieldDeclaration.bindTarget.metadataPath,
			this.inputFieldDeclaration.bindTarget.filePath ?? this.filePath,
			this.uuid
		);
	}

	getInitialValue(): MBExtendedLiteral {
		if (!this.inputField) {
			throw new MetaBindInternalError(ErrorLevel.CRITICAL, 'can not get initial value for input field', 'input field is undefined');
		}

		if (this.inputFieldDeclaration?.isBound && this.inputFieldDeclaration.bindTarget) {
			let value: MBExtendedLiteral | undefined = traverseObjectByPath(this.inputFieldDeclaration.bindTarget.metadataPath, this.metadataCache?.metadata);
			value = value === undefined ? this.inputField.getFallbackDefaultValue() : value;
			console.debug(
				`meta-bind | InputFieldMarkdownRenderChild >> setting initial value to ${value} (typeof ${typeof value}) for input field ${this.uuid}`
			);
			return value;
		} else {
			return this.inputField.getFallbackDefaultValue();
		}
	}

	getArguments(name: InputFieldArgumentType): AbstractInputFieldArgument[] {
		if (this.inputFieldDeclaration.errorCollection.hasErrors()) {
			throw new MetaBindInternalError(ErrorLevel.ERROR, 'can not retrieve arguments', 'inputFieldDeclaration has errors');
		}

		return this.inputFieldDeclaration.argumentContainer.getAll(name);
	}

	getArgument(name: InputFieldArgumentType): AbstractInputFieldArgument | undefined {
		return this.getArguments(name).at(0);
	}

	addCardContainer(): boolean {
		const containerInputFieldType =
			this.inputFieldDeclaration.inputFieldType === InputFieldType.SELECT ||
			this.inputFieldDeclaration.inputFieldType === InputFieldType.MULTI_SELECT_DEPRECATED ||
			this.inputFieldDeclaration.inputFieldType === InputFieldType.MULTI_SELECT ||
			this.inputFieldDeclaration.inputFieldType === InputFieldType.LIST;

		const hasContainerArgument = isTruthy(this.getArgument(InputFieldArgumentType.SHOWCASE)) || isTruthy(this.getArgument(InputFieldArgumentType.TITLE));

		return this.renderChildType === RenderChildType.BLOCK && (containerInputFieldType || hasContainerArgument);
	}

	hasValidBindTarget(): boolean {
		return isTruthy(this.inputFieldDeclaration?.isBound) && isTruthy(this.inputFieldDeclaration.bindTarget);
	}

	async onload(): Promise<void> {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('meta-bind-plugin-input');
		this.containerEl.empty();

		if (!this.errorCollection.hasErrors() && !this.inputField) {
			this.errorCollection.add(new MetaBindInternalError(ErrorLevel.CRITICAL, "can't render input field", 'input field is undefined'));
		}

		// if there is an error, render error then quit
		if (this.errorCollection.hasErrors()) {
			new ErrorIndicatorComponent({
				target: this.containerEl,
				props: {
					app: this.plugin.app,
					errorCollection: this.errorCollection,
					declaration: this.fullDeclaration,
				},
			});
			return;
		}

		// if card container this points to the container.
		let wrapperContainer: HTMLElement;

		const showcaseArgument: ShowcaseInputFieldArgument | undefined = this.getArgument(InputFieldArgumentType.SHOWCASE) as
			| ShowcaseInputFieldArgument
			| undefined;
		const titleArgument: TitleInputFieldArgument | undefined = this.getArgument(InputFieldArgumentType.TITLE) as TitleInputFieldArgument | undefined;

		if (this.addCardContainer()) {
			const cardContainer: HTMLDivElement = this.containerEl.createDiv({ cls: 'meta-bind-plugin-card' });
			if (titleArgument) {
				cardContainer.createEl('h3', { text: titleArgument.value });
			}

			wrapperContainer = cardContainer;
		} else {
			wrapperContainer = this.containerEl;
		}

		new ErrorIndicatorComponent({
			target: wrapperContainer,
			props: {
				app: this.plugin.app,
				errorCollection: this.errorCollection,
				declaration: this.fullDeclaration,
			},
		});

		if (this.hasValidBindTarget()) {
			this.metadataCache = this.registerSelfToMetadataManager();
		}
		this.plugin.mdrcManager.registerMDRC(this);

		// input field container
		const container: HTMLDivElement = createDiv();
		container.addClass('meta-bind-plugin-input-wrapper');

		this.inputField?.filterValue(this.getInitialValue());
		this.inputField?.render(container);

		const classArguments: ClassInputFieldArgument[] = this.getArguments(InputFieldArgumentType.CLASS) as ClassInputFieldArgument[];
		if (classArguments) {
			this.inputField?.getHtmlElement().addClasses(classArguments.map(x => x.value).flat());
		}

		wrapperContainer.appendChild(container);

		if (this.addCardContainer() && showcaseArgument) {
			wrapperContainer.createEl('code', { text: this.fullDeclaration, cls: 'meta-bind-none' });
		}
	}

	onunload(): void {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> unload', this);

		this.inputField?.destroy();
		this.plugin.mdrcManager.unregisterMDRC(this);
		this.unregisterSelfFromMetadataManager();

		this.containerEl.empty();
		this.containerEl.createEl('span', { text: 'unloaded meta bind input field', cls: 'meta-bind-plugin-error' });

		super.onunload();
	}
}
