import { AbstractInputField } from '../AbstractInputField';
import SuggestInput from './SuggestInput.svelte';
import { InputFieldArgumentType } from '../../parsers/InputFieldDeclarationParser';
import { DataArray, getAPI, Literal } from 'obsidian-dataview';
import { SuggestInputModal } from './SuggestInputModal';
import { Notice, TFile } from 'obsidian';
import { ErrorLevel, MetaBindArgumentError, MetaBindInternalError, MetaBindPublishError } from '../../utils/errors/MetaBindErrors';
import { OptionInputFieldArgument } from '../../inputFieldArguments/arguments/OptionInputFieldArgument';
import { OptionQueryInputFieldArgument } from '../../inputFieldArguments/arguments/OptionQueryInputFieldArgument';
import { InputFieldMDRC } from '../../renderChildren/InputFieldMDRC';
import MetaBindPlugin from '../../main';

export interface SuggestOption {
	value: string;
	displayValue: string;
}

export class SuggestInputField extends AbstractInputField {
	container: HTMLDivElement | undefined;
	component: SuggestInput | undefined;
	value: string;
	options: SuggestOption[];

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.value = '';
		this.options = [];

		if (this.renderChild.plugin instanceof MetaBindPlugin) {
			if (this.needsDataview()) {
				if (!getAPI(this.renderChild.plugin.app)) {
					throw new MetaBindArgumentError(
						ErrorLevel.ERROR,
						'can not create suggest input field',
						`dataview needs to be installed and enabled to use suggest option queries`
					);
				}
			}
		} else {
			this.renderChild.errorCollection.add(
				new MetaBindPublishError(ErrorLevel.WARNING, 'can not interact with input field', 'input field only supported in the obsidian app')
			);
		}
	}

	getValue(): string | undefined {
		if (!this.component) {
			return undefined;
		}
		return this.value;
	}

	setValue(value: any): void {
		this.value = value;
		this.component?.updateValue(value);
	}

	isEqualValue(value: any): boolean {
		return this.value == value;
	}

	getDefaultValue(): any {
		return '';
	}

	getHtmlElement(): HTMLElement {
		if (!this.container) {
			throw new MetaBindInternalError(ErrorLevel.WARNING, 'failed to get html element for input field', "container is undefined, field hasn't been rendered yet");
		}

		return this.container;
	}

	needsDataview(): boolean {
		return this.renderChild.getArguments(InputFieldArgumentType.OPTION_QUERY).length > 0;
	}

	async getOptions(): Promise<void> {
		this.options = [];

		const optionArguments: OptionInputFieldArgument[] = this.renderChild.getArguments(InputFieldArgumentType.OPTION);
		const optionQueryArguments: OptionQueryInputFieldArgument[] = this.renderChild.getArguments(InputFieldArgumentType.OPTION_QUERY);

		for (const suggestOptionsArgument of optionArguments) {
			this.options.push({ value: suggestOptionsArgument.value, displayValue: suggestOptionsArgument.value });
		}

		if (this.renderChild.plugin instanceof MetaBindPlugin && optionQueryArguments.length > 0) {
			const dv = getAPI(this.renderChild.plugin.app);

			if (!dv) {
				new Notice('meta-bind | dataview needs to be installed and enabled to use suggest option queries');
				return;
			}

			for (const suggestOptionsQueryArgument of optionQueryArguments) {
				const result: DataArray<Record<string, Literal>> = await dv.pages(suggestOptionsQueryArgument.value, this.renderChild.filePath);
				result.forEach((file: Record<string, Literal>) => {
					try {
						const tFile: TFile = file.file as TFile;
						this.options.push({
							value: `[[${tFile.path}|${tFile.name}]]`,
							displayValue: `file: ${tFile.name}`,
						});
					} catch (e) {
						console.warn('meta-bind | error while computing suggest options', e);
					}
				});
			}
		}
	}

	async showSuggest(): Promise<void> {
		if (!(this.renderChild.plugin instanceof MetaBindPlugin)) {
			console.warn(new MetaBindArgumentError(ErrorLevel.WARNING, 'can not use input field', `input field only supported in the obsidian app`));
			return;
		}
		await this.getOptions();
		new SuggestInputModal(this.renderChild.plugin.app, this.options, item => {
			this.setValue(item.value);
			this.onValueChange(item.value);
		}).open();
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | SuggestInputField >> render ${this.renderChild.uuid}`);

		this.container = container;

		this.value = this.renderChild.getInitialValue();

		this.component = new SuggestInput({
			target: container,
			props: {
				showSuggest: () => this.showSuggest(),
			},
		});

		this.component.updateValue(this.value);
	}

	destroy(): void {
		this.component?.$destroy();
	}
}
