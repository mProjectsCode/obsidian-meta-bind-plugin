import { InputFieldMarkdownRenderChild } from '../../InputFieldMarkdownRenderChild';
import { AbstractInputField } from '../AbstractInputField';
import Suggest from './Suggest.svelte';
import { InputFieldArgumentType } from '../../parsers/InputFieldDeclarationParser';
import { DataArray, getAPI, Literal } from 'obsidian-dataview';
import { AbstractInputFieldArgument } from '../../inputFieldArguments/AbstractInputFieldArgument';
import { SuggestInputModal } from './SuggestInputModal';
import { Notice, TFile } from 'obsidian';
import { MetaBindArgumentError, MetaBindInternalError } from '../../utils/MetaBindErrors';

export interface SuggestOption {
	value: string;
	displayValue: string;
}

export class SuggestInputField extends AbstractInputField {
	container: HTMLDivElement | undefined;
	component: Suggest | undefined;
	value: string;
	options: SuggestOption[];

	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => void | Promise<void>) {
		super(inputFieldMarkdownRenderChild, onValueChange);

		this.value = '';
		this.options = [];

		if (this.needsDataview()) {
			if (!getAPI(this.inputFieldMarkdownRenderChild.plugin.app)) {
				throw new MetaBindArgumentError(`dataview needs to be installed and enabled to use suggest option queries`);
			}
		}
	}

	getValue(): string {
		return '';
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
			throw new MetaBindInternalError('');
		}

		return this.container;
	}

	needsDataview(): boolean {
		return this.inputFieldMarkdownRenderChild.getArguments(InputFieldArgumentType.SUGGEST_OPTION_QUERY).length > 0;
	}

	async getOptions(): Promise<void> {
		this.options = [];

		const suggestOptionsArguments: AbstractInputFieldArgument[] = this.inputFieldMarkdownRenderChild.getArguments(InputFieldArgumentType.SUGGEST_OPTION);
		const suggestOptionsQueryArguments: AbstractInputFieldArgument[] = this.inputFieldMarkdownRenderChild.getArguments(InputFieldArgumentType.SUGGEST_OPTION_QUERY);

		for (const suggestOptionsArgument of suggestOptionsArguments) {
			this.options.push({ value: suggestOptionsArgument.value, displayValue: suggestOptionsArgument.value });
		}

		if (suggestOptionsQueryArguments.length > 0) {
			const dv = getAPI(this.inputFieldMarkdownRenderChild.plugin.app);

			if (!dv) {
				new Notice('meta-bind | dataview needs to be installed and enabled to use suggest option queries');
				return;
			}

			for (const suggestOptionsQueryArgument of suggestOptionsQueryArguments) {
				const result: DataArray<Record<string, Literal>> = await dv.pages(suggestOptionsQueryArgument.value, this.inputFieldMarkdownRenderChild.filePath);
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
		await this.getOptions();
		new SuggestInputModal(this.inputFieldMarkdownRenderChild.plugin.app, this.options, item => {
			this.setValue(item.value);
			this.onValueChange(item.value);
		}).open();
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | SuggestInputField >> render ${this.inputFieldMarkdownRenderChild.uuid}`);

		this.container = container;

		this.value = this.inputFieldMarkdownRenderChild.getInitialValue();

		this.component = new Suggest({
			target: container,
			props: {
				showSuggest: () => this.showSuggest(),
			},
		});

		this.component.updateValue(this.value);
	}
}
