import { AbstractInputField } from '../../AbstractInputField';
import ListSuggestInput from './ListSuggestInput.svelte';
import { DataArray, getAPI, Literal } from 'obsidian-dataview';
import { SuggestInputModal } from '../Suggest/SuggestInputModal';
import { Notice } from 'obsidian';
import { ErrorLevel, MetaBindArgumentError, MetaBindInternalError } from '../../../utils/errors/MetaBindErrors';
import { OptionInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { OptionQueryInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionQueryInputFieldArgument';
import { InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { MBExtendedLiteral, MBLiteral } from '../../../utils/Utils';
import { InputFieldArgumentType } from '../../../parsers/inputFieldParser/InputFieldConfigs';
import { UseLinksInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/UseLinksInputFieldArgument';
import { SuggestOption } from '../Suggest/SuggestInputField';

type T = MBLiteral[];

export class ListSuggestInputField extends AbstractInputField<T> {
	container: HTMLDivElement | undefined;
	component: ListSuggestInput | undefined;
	value: T;
	options: SuggestOption[];

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.value = this.getDefaultValue();

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
		return this.value;
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		if (value == null || !Array.isArray(value)) {
			return undefined;
		}

		return value;
	}

	updateDisplayValue(value: T): void {
		this.value = value;
		this.component?.updateValue(value);
	}

	getFallbackDefaultValue(): MBLiteral[] {
		return [];
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

		const useLinksArgument: UseLinksInputFieldArgument | undefined = this.renderChild.getArgument(InputFieldArgumentType.USE_LINKS) as
			| UseLinksInputFieldArgument
			| undefined;

		for (const suggestOptionsArgument of optionArguments) {
			this.options.push(new SuggestOption(suggestOptionsArgument.value, suggestOptionsArgument.name));
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
						const tFile: any = file.file as any;
						if (useLinksArgument?.value === undefined || useLinksArgument?.value === true) {
							this.options.push(new SuggestOption(`[[${tFile.path}|${tFile.name}]]`, `file: ${tFile.name}`));
						} else {
							// console.log(tFile);
							this.options.push(new SuggestOption(tFile.name, `file: ${tFile.name}`));
						}
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
			this.value.push(item.value);
			this.updateDisplayValue(this.value);
			this.onValueChange(this.value);
		}).open();
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | SuggestInputField >> render ${this.renderChild.uuid}`);

		this.container = container;

		this.updateDisplayValue(this.getInitialValue());

		this.component = new ListSuggestInput({
			target: container,
			props: {
				showSuggest: () => this.showSuggest(),
				onValueChange: (value: T) => this.onValueChange(value),
			},
		});

		this.component.updateValue(this.value);
	}

	destroy(): void {
		this.component?.$destroy();
	}
}
