import { type ClassInputFieldArgument } from '../fields/fieldArguments/inputFieldArguments/arguments/ClassInputFieldArgument';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { type ShowcaseInputFieldArgument } from '../fields/fieldArguments/inputFieldArguments/arguments/ShowcaseInputFieldArgument';
import { type TitleInputFieldArgument } from '../fields/fieldArguments/inputFieldArguments/arguments/TitleInputFieldArgument';
import { isTruthy } from '../utils/Utils';
import { AbstractMDRC } from './AbstractMDRC';
import type MetaBindPlugin from '../main';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import {
	type BindTargetDeclaration,
	type FullBindTarget,
	type InputFieldDeclaration,
} from '../parsers/inputFieldParser/InputFieldDeclaration';
import { type InputField } from '../fields/inputFields/InputFieldFactory';
import { type InputFieldArgumentMapType } from '../fields/fieldArguments/inputFieldArguments/InputFieldArgumentFactory';
import { InputFieldArgumentType, InputFieldType } from '../config/FieldConfigs';
import { DocsHelper } from '../utils/DocsHelper';
import { type IInputFieldBase } from '../fields/inputFields/IInputFieldBase';

export enum RenderChildType {
	INLINE = 'inline',
	BLOCK = 'block',
}

export class InputFieldMDRC extends AbstractMDRC implements IInputFieldBase {
	inputField: InputField | undefined;

	fullDeclaration?: string;
	inputFieldDeclaration: InputFieldDeclaration;

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
	}

	public getArguments<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T>[] {
		if (this.inputFieldDeclaration.errorCollection.hasErrors()) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not retrieve arguments',
				cause: 'inputFieldDeclaration has errors',
			});
		}

		return this.inputFieldDeclaration.argumentContainer.getAll(name);
	}

	public getArgument<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T> | undefined {
		return this.getArguments(name).at(0);
	}

	public isBound(): boolean {
		return isTruthy(this.inputFieldDeclaration?.isBound);
	}

	public getBindTarget(): BindTargetDeclaration | undefined {
		return this.isBound() ? this.inputFieldDeclaration.bindTarget : undefined;
	}

	public getUuid(): string {
		return this.uuid;
	}

	public getFullBindTarget(): FullBindTarget | undefined {
		const bindTarget = this.getBindTarget();
		if (!bindTarget) {
			return undefined;
		}
		try {
			return this.plugin.api.bindTargetParser.toFullDeclaration(bindTarget, this.filePath);
		} catch (e) {
			this.errorCollection.add(e);
			return undefined;
		}
	}

	public getFilePath(): string {
		return this.filePath;
	}

	private shouldAddCardContainer(): boolean {
		const containerInputFieldType =
			this.inputFieldDeclaration.inputFieldType === InputFieldType.SELECT ||
			this.inputFieldDeclaration.inputFieldType === InputFieldType.MULTI_SELECT_DEPRECATED ||
			this.inputFieldDeclaration.inputFieldType === InputFieldType.MULTI_SELECT ||
			this.inputFieldDeclaration.inputFieldType === InputFieldType.LIST;

		const hasContainerArgument =
			isTruthy(this.getArgument(InputFieldArgumentType.SHOWCASE)) ||
			isTruthy(this.getArgument(InputFieldArgumentType.TITLE));

		return this.renderChildType === RenderChildType.BLOCK && (containerInputFieldType || hasContainerArgument);
	}

	private createErrorIndicator(el: HTMLElement): void {
		new ErrorIndicatorComponent({
			target: el,
			props: {
				app: this.plugin.app,
				errorCollection: this.errorCollection,
				declaration: this.fullDeclaration,
			},
		});
	}

	private createWrapper(): HTMLElement {
		const titleArgument: TitleInputFieldArgument | undefined = this.getArgument(InputFieldArgumentType.TITLE);

		// --- Determine Wrapper Element ---
		if (this.shouldAddCardContainer()) {
			const cardContainer: HTMLDivElement = this.containerEl.createDiv({ cls: 'mb-card' });
			if (titleArgument) {
				cardContainer.createEl('h3', { text: titleArgument.value });
			}

			return cardContainer;
		} else {
			return this.containerEl;
		}
	}

	private addShowcaseArgument(container: HTMLElement): void {
		const showcaseArgument: ShowcaseInputFieldArgument | undefined = this.getArgument(
			InputFieldArgumentType.SHOWCASE,
		);
		if (this.shouldAddCardContainer() && showcaseArgument) {
			const codeEl = container.createEl('code', { cls: 'mb-none' });
			codeEl.createEl('a', {
				text: this.fullDeclaration,
				href: DocsHelper.linkToInputField(this.inputFieldDeclaration.inputFieldType),
				cls: 'mb-no-link',
			});
		}
	}

	private createInputField(): void {
		if (!this.errorCollection.hasErrors()) {
			try {
				this.inputField = this.plugin.api.inputFieldFactory.createInputField(
					this.inputFieldDeclaration.inputFieldType,
					this.renderChildType,
					this,
				);
			} catch (e) {
				this.errorCollection.add(e);
			}
		}

		if (!this.errorCollection.hasErrors() && !this.inputField) {
			this.errorCollection.add(
				new MetaBindInternalError({
					errorLevel: ErrorLevel.CRITICAL,
					effect: "can't render input field",
					cause: 'input field is undefined',
				}),
			);
		}
	}

	onload(): void {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('mb-input');
		this.containerEl.empty();

		this.createInputField();

		// if there is an error, render error then quit
		if (this.errorCollection.hasErrors()) {
			this.createErrorIndicator(this.containerEl);
			return;
		}

		// --- Register to MDRC manager ---
		this.plugin.mdrcManager.registerMDRC(this);

		const wrapperContainer = this.createWrapper();

		// --- Create Error Indicator ---
		this.createErrorIndicator(wrapperContainer);

		// --- Create Container Element ---
		const container: HTMLDivElement = wrapperContainer.createDiv();
		container.addClass('mb-input-wrapper');

		// --- Mount Input Field ---
		this.inputField?.mount(container);

		// --- Apply Class Arguments ---
		const classArguments: ClassInputFieldArgument[] = this.getArguments(InputFieldArgumentType.CLASS);
		if (classArguments) {
			container.addClasses(classArguments.map(x => x.value).flat());
		}

		// --- Apply Block or Inline Class ---
		if (this.renderChildType === RenderChildType.BLOCK) {
			this.containerEl.addClass('mb-input-block');
		} else {
			this.containerEl.addClass('mb-input-inline');
		}

		this.addShowcaseArgument(wrapperContainer);
	}

	onunload(): void {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> unload', this);

		this.inputField?.destroy();
		this.plugin.mdrcManager.unregisterMDRC(this);

		this.containerEl.empty();
		this.containerEl.createEl('span', { text: 'unloaded meta bind input field', cls: 'mb-error' });

		super.onunload();
	}
}
