import { InputFieldArgumentType, type InputFieldType } from '../config/FieldConfigs';
import { type UnvalidatedInputFieldDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';
import type MetaBindPlugin from '../main';

export const INPUT_FIELD_EXAMPLE_DECLARATIONS: Record<InputFieldType, string> = {
	date: 'date',
	datePicker: 'datePicker',
	editor: 'editor',
	imageSuggester: 'imageSuggester(optionQuery(""))',
	inlineList: 'inlineList',
	inlineListSuggester: 'inlineListSuggester(option(apple), option(banana), option(lemon))',
	inlineSelect: 'inlineSelect(option(apple), option(banana), option(lemon))',
	list: 'list',
	listSuggester: 'listSuggester(option(apple), option(banana), option(lemon))',
	multiSelect: 'multiSelect(option(apple), option(banana), option(lemon))',
	number: 'number',
	progressBar: 'progressBar',
	select: 'select(option(apple), option(banana), option(lemon))',
	slider: 'slider(addLabels)',
	suggester: 'suggester(option(apple), option(banana), option(lemon))',
	text: 'text',
	textArea: 'textArea',
	time: 'time',
	toggle: 'toggle',

	date_picker: '',
	multi_select: '',
	text_area: '',
	invalid: '',
};

export function createInputFieldExamples(plugin: MetaBindPlugin): [InputFieldType, UnvalidatedInputFieldDeclaration][] {
	const ret: [InputFieldType, UnvalidatedInputFieldDeclaration][] = [];
	for (const [type, declaration] of Object.entries(INPUT_FIELD_EXAMPLE_DECLARATIONS)) {
		if (declaration === '') {
			continue;
		}

		let parsedDeclaration = plugin.api.inputField.createInputFieldDeclarationFromString(`INPUT[${declaration}]`);
		parsedDeclaration = plugin.api.inputField.addArgument(parsedDeclaration, {
			name: InputFieldArgumentType.SHOWCASE,
			value: ['true'],
		});
		parsedDeclaration = plugin.api.inputField.addArgument(parsedDeclaration, {
			name: InputFieldArgumentType.TITLE,
			value: [type],
		});

		ret.push([type as InputFieldType, parsedDeclaration]);
	}
	return ret;
}
