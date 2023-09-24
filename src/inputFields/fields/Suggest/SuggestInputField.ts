import { AbstractInputField } from '../../AbstractInputField';
import SuggestInput from './SuggestInput.svelte';
import { DataArray, getAPI, Literal } from 'obsidian-dataview';
import { SuggestInputModal } from './SuggestInputModal';
import { Notice, TFile } from 'obsidian';
import { ErrorLevel, MetaBindArgumentError, MetaBindInternalError } from '../../../utils/errors/MetaBindErrors';
import { OptionInputFieldArgument } from '../../../inputFieldArguments/arguments/OptionInputFieldArgument';
import { OptionQueryInputFieldArgument } from '../../../inputFieldArguments/arguments/OptionQueryInputFieldArgument';
import { InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { MBExtendedLiteral, MBLiteral, parseLiteral, stringifyLiteral } from '../../../utils/Utils';
import { InputFieldArgumentType } from '../../InputFieldConfigs';

export interface SuggestOption {
	value: MBLiteral;
	displayValue: string;
}

type T = MBLiteral;

export class SuggestInputField extends AbstractInputField<T> {
	container: HTMLDivElement | undefined;
	component: SuggestInput | undefined;
	value: string;
	options: SuggestOption[];

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.value = this.getFallbackDefaultValue();
		this.options = [];

		if (this.needsDataview()) {
			if (!getAPI(this.renderChild.plugin.app)) {
				throw new MetaBindArgumentError(
					ErrorLevel.ERROR,
					'can not create suggest input field',
					`dataview needs to be installed and enabled to use suggest option queries`
				);
			}
		}
	}

	getValue(): T | undefined {
		if (!this.component) {
			return undefined;
		}
		return parseLiteral(this.value);
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		if (value === undefined || typeof value === 'object') {
			return undefined;
		}

		return value;
	}

	updateDisplayValue(value: T): void {
		this.value = stringifyLiteral(value);
		this.component?.updateValue(this.value);
	}

	getFallbackDefaultValue(): string {
		return '';
	}

	getHtmlElement(): HTMLElement {
		if (!this.container) {
			throw new MetaBindInternalError(
				ErrorLevel.WARNING,
				'failed to get html element for input field',
				"container is undefined, field hasn't been rendered yet"
			);
		}

		return this.container;
	}

	needsDataview(): boolean {
		return this.renderChild.getArguments(InputFieldArgumentType.OPTION_QUERY).length > 0;
	}

	async getOptions(): Promise<void> {
		this.options = [];

		const optionArguments: OptionInputFieldArgument[] = this.renderChild.getArguments(InputFieldArgumentType.OPTION) as OptionInputFieldArgument[];
		const optionQueryArguments: OptionQueryInputFieldArgument[] = this.renderChild.getArguments(
			InputFieldArgumentType.OPTION_QUERY
		) as OptionQueryInputFieldArgument[];

		for (const suggestOptionsArgument of optionArguments) {
			this.options.push({ value: suggestOptionsArgument.value, displayValue: suggestOptionsArgument.name });
		}

		if (optionQueryArguments.length > 0) {
			const dv = getAPI(this.renderChild.plugin.app);

			if (!dv) {
				new Notice('meta-bind | dataview needs to be installed and enabled to use suggest option queries');
				return;
			}

			for (const suggestOptionsQueryArgument of optionQueryArguments) {
				const result: DataArray<Record<string, Literal>> = dv.pages(suggestOptionsQueryArgument.value, this.renderChild.filePath);
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
		new SuggestInputModal(this.renderChild.plugin.app, this.options, item => {
			this.updateDisplayValue(item.value);
			this.onValueChange(item.value);
		}).open();
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | SuggestInputField >> render ${this.renderChild.uuid}`);

		this.container = container;

		this.updateDisplayValue(this.getInitialValue());

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
