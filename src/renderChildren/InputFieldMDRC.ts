import { AbstractInputField } from '../inputFields/AbstractInputField';
import { InputFieldFactory } from '../inputFields/InputFieldFactory';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldType } from '../parsers/InputFieldDeclarationParser';
import { AbstractInputFieldArgument } from '../inputFieldArguments/AbstractInputFieldArgument';
import { ClassInputFieldArgument } from '../inputFieldArguments/arguments/ClassInputFieldArgument';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { MetadataFileCache } from '../metadata/MetadataManager';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { ShowcaseInputFieldArgument } from '../inputFieldArguments/arguments/ShowcaseInputFieldArgument';
import { TitleInputFieldArgument } from '../inputFieldArguments/arguments/TitleInputFieldArgument';
import { isTruthy } from '../utils/Utils';
import { Listener, Signal } from '../utils/Signal';
import { BindTargetDeclaration } from '../parsers/BindTargetParser';
import { AbstractMDRC } from './AbstractMDRC';
import { PublishMetadataFileCache } from '../metadata/PublishMetadataManager';
import { AbstractPlugin } from '../AbstractPlugin';

export enum RenderChildType {
	INLINE = 'inline',
	BLOCK = 'block',
}

export class InputFieldMDRC extends AbstractMDRC {
	metadataCache: MetadataFileCache | PublishMetadataFileCache | undefined;
	inputField: AbstractInputField | undefined;

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

	constructor(
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: InputFieldDeclaration,
		plugin: AbstractPlugin,
		filePath: string,
		uuid: string,
		frontmatter: any | null | undefined = undefined
	) {
		super(containerEl, renderChildType, plugin, filePath, uuid, frontmatter);

		this.errorCollection.merge(declaration.errorCollection);

		this.fullDeclaration = declaration.fullDeclaration;
		this.inputFieldDeclaration = declaration;

		this.writeSignal = new Signal<any>(undefined);
		this.readSignal = new Signal<any>(undefined);

		if (!this.errorCollection.hasErrors()) {
			try {
				if (this.inputFieldDeclaration.isBound) {
					this.bindTargetDeclaration = this.plugin.api.bindTargetParser.parseBindTarget(this.inputFieldDeclaration.bindTarget, this.filePath);
				}

				this.inputField = InputFieldFactory.createInputField(this.inputFieldDeclaration.inputFieldType, {
					renderChildType: renderChildType,
					inputFieldMDRC: this,
				});
			} catch (e: any) {
				this.errorCollection.add(e);
			}
		}
	}

	registerSelfToMetadataManager(): MetadataFileCache | PublishMetadataFileCache | undefined {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.bindTargetDeclaration) {
			return;
		}

		this.metadataManagerReadSignalListener = this.readSignal.registerListener({ callback: this.updateMetadataManager.bind(this) });

		return this.plugin.metadataManager.register(this.bindTargetDeclaration.filePath, undefined, this.writeSignal, this.bindTargetDeclaration.metadataPath, this.uuid);
	}

	unregisterSelfFromMetadataManager(): void {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.bindTargetDeclaration) {
			return;
		}

		if (this.metadataManagerReadSignalListener) {
			this.readSignal.unregisterListener(this.metadataManagerReadSignalListener);
		}

		this.plugin.metadataManager.unregister(this.bindTargetDeclaration.filePath, this.uuid);
	}

	updateMetadataManager(value: any): void {
		// if bind target is invalid, return
		if (!this.inputFieldDeclaration?.isBound || !this.bindTargetDeclaration) {
			return;
		}

		this.plugin.metadataManager.updatePropertyInCache(value, this.bindTargetDeclaration.metadataPath, this.bindTargetDeclaration.filePath, this.uuid);
	}

	getInitialValue(): any | undefined {
		if (this.inputFieldDeclaration?.isBound && this.bindTargetDeclaration) {
			const value = traverseObjectByPath(this.bindTargetDeclaration.metadataPath, this.metadataCache?.metadata);
			console.debug(`meta-bind | InputFieldMarkdownRenderChild >> setting initial value to ${value} (typeof ${typeof value}) for input field ${this.uuid}`);
			return value ?? this.inputField?.getDefaultValue();
		}
	}

	getArguments(name: InputFieldArgumentType): AbstractInputFieldArgument[] {
		if (this.inputFieldDeclaration.errorCollection.hasErrors()) {
			throw new MetaBindInternalError(ErrorLevel.ERROR, 'can not retrieve arguments', 'inputFieldDeclaration has errors');
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

		if (!this.inputField) {
			this.errorCollection.add(new MetaBindInternalError(ErrorLevel.CRITICAL, "can't render input field", 'input field is undefined'));
		}

		this.renderError();
		if (this.errorCollection.hasErrors()) {
			return;
		}

		if (this.hasValidBindTarget()) {
			this.metadataCache = this.registerSelfToMetadataManager();
		}
		this.plugin.mdrcManager.registerMDRC(this);

		this.inputField?.render(container);

		const classArguments: ClassInputFieldArgument[] = this.getArguments(InputFieldArgumentType.CLASS);
		if (classArguments) {
			this.inputField?.getHtmlElement().addClasses(classArguments.map(x => x.value).flat());
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

	renderError(): void {
		if (this.renderChildType === RenderChildType.BLOCK) {
			this.containerEl.empty();

			const cardContainer: HTMLDivElement = this.containerEl.createDiv({ cls: 'meta-bind-plugin-card' });
			cardContainer.createEl('code', { text: ` ${this.fullDeclaration} ` });

			this.errorCollection.render(cardContainer);
		} else {
			this.errorCollection.render(this.containerEl);
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
