import { type ClassInputFieldArgument } from '../fieldArguments/inputFieldArguments/arguments/ClassInputFieldArgument';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { type ShowcaseInputFieldArgument } from '../fieldArguments/inputFieldArguments/arguments/ShowcaseInputFieldArgument';
import { type TitleInputFieldArgument } from '../fieldArguments/inputFieldArguments/arguments/TitleInputFieldArgument';
import { isTruthy } from '../utils/Utils';
import { type Listener, Signal } from '../utils/Signal';
import { AbstractMDRC } from './AbstractMDRC';
import type MetaBindPlugin from '../main';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import { type InputFieldDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';
import { InputFieldArgumentType, InputFieldType } from '../parsers/inputFieldParser/InputFieldConfigs';
import { type NewInputField } from '../inputFields/InputFieldFactory';
import { type InputFieldArgumentMapType } from '../fieldArguments/inputFieldArguments/InputFieldArgumentFactory';
import { type MetadataSubscription } from '../metadata/MetadataSubscription';

export enum RenderChildType {
	INLINE = 'inline',
	BLOCK = 'block',
}

export class InputFieldMDRC extends AbstractMDRC {
	inputField: NewInputField | undefined;

	fullDeclaration?: string;
	inputFieldDeclaration: InputFieldDeclaration;

	private metadataManagerOutputSignalListener: Listener<unknown> | undefined;

	/**
	 * Signal to write to the input field
	 */
	public inputSignal: Signal<unknown>;
	/**
	 * Signal to read from the input field
	 */
	public outputSignal: Signal<unknown>;

	private metadataSubscription?: MetadataSubscription;

	constructor(
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: InputFieldDeclaration,
		plugin: MetaBindPlugin,
		filePath: string,
		uuid: string,
	) {
		super(containerEl, renderChildType, plugin, filePath, uuid);

		this.errorCollection.merge(declaration.errorCollection);

		this.fullDeclaration = declaration.fullDeclaration;
		this.inputFieldDeclaration = declaration;

		this.inputSignal = new Signal<unknown>(undefined);
		this.outputSignal = new Signal<unknown>(undefined);

		if (!this.errorCollection.hasErrors()) {
			try {
				this.inputField = this.plugin.api.inputFieldFactory.createInputField(this.inputFieldDeclaration.inputFieldType, renderChildType, this);
				this.inputField?.registerListener({ callback: value => this.outputSignal.set(value) });
			} catch (e) {
				this.errorCollection.add(e);
			}
		}
	}

	registerSelfToMetadataManager(): undefined {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.inputFieldDeclaration.bindTarget) {
			return;
		}

		this.metadataSubscription = this.plugin.metadataManager.subscribe(
			this.uuid,
			this.inputSignal,
			this.plugin.api.bindTargetParser.toFullDeclaration(this.inputFieldDeclaration.bindTarget, this.filePath),
		);

		this.metadataManagerOutputSignalListener = this.outputSignal.registerListener({ callback: value => this.updateMetadataManager(value) });
	}

	unregisterSelfFromMetadataManager(): void {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.inputFieldDeclaration.bindTarget) {
			return;
		}

		if (this.metadataManagerOutputSignalListener) {
			this.outputSignal.unregisterListener(this.metadataManagerOutputSignalListener);
		}

		this.metadataSubscription?.unsubscribe();
	}

	updateMetadataManager(value: unknown): void {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.inputFieldDeclaration.bindTarget) {
			return;
		}

		this.metadataSubscription?.update(value);
	}

	getArguments<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T>[] {
		if (this.inputFieldDeclaration.errorCollection.hasErrors()) {
			throw new MetaBindInternalError(ErrorLevel.ERROR, 'can not retrieve arguments', 'inputFieldDeclaration has errors');
		}

		return this.inputFieldDeclaration.argumentContainer.getAll(name);
	}

	getArgument<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T> | undefined {
		return this.getArguments(name).at(0);
	}

	shouldAddCardContainer(): boolean {
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

	onload(): void {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('mb-input');
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

		const showcaseArgument: ShowcaseInputFieldArgument | undefined = this.getArgument(InputFieldArgumentType.SHOWCASE);
		const titleArgument: TitleInputFieldArgument | undefined = this.getArgument(InputFieldArgumentType.TITLE);

		// --- Determine Wrapper Element ---
		if (this.shouldAddCardContainer()) {
			const cardContainer: HTMLDivElement = this.containerEl.createDiv({ cls: 'mb-card' });
			if (titleArgument) {
				cardContainer.createEl('h3', { text: titleArgument.value });
			}

			wrapperContainer = cardContainer;
		} else {
			wrapperContainer = this.containerEl;
		}

		// --- Create Error Indicator ---
		new ErrorIndicatorComponent({
			target: wrapperContainer,
			props: {
				app: this.plugin.app,
				errorCollection: this.errorCollection,
				declaration: this.fullDeclaration,
			},
		});

		// --- Register to Metadata ---
		if (this.hasValidBindTarget()) {
			this.registerSelfToMetadataManager();
		}

		// --- Register to MDRC manager ---
		this.plugin.mdrcManager.registerMDRC(this);

		// --- Create Container Element ---
		const container: HTMLDivElement = createDiv();
		container.addClass('mb-input-wrapper');

		// --- Mount Input Field ---
		this.inputField?.mount(container);

		// --- Apply Class Arguments ---
		const classArguments: ClassInputFieldArgument[] = this.getArguments(InputFieldArgumentType.CLASS);
		if (classArguments) {
			container.addClasses(classArguments.map(x => x.value).flat());
		}

		// --- Append Container Element to Wrapper ---
		wrapperContainer.appendChild(container);

		// --- Add Showcase Argument ---
		if (this.shouldAddCardContainer() && showcaseArgument) {
			wrapperContainer.createEl('code', { text: this.fullDeclaration, cls: 'mb-none' });
		}
	}

	onunload(): void {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> unload', this);

		this.inputField?.unmount();
		this.plugin.mdrcManager.unregisterMDRC(this);
		this.unregisterSelfFromMetadataManager();

		this.containerEl.empty();
		this.containerEl.createEl('span', { text: 'unloaded meta bind input field', cls: 'mb-error' });

		super.onunload();
	}
}
