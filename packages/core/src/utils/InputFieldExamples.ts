import { type IPlugin } from 'packages/core/src/IPlugin';
import {
	InputFieldArgumentType,
	InputFieldConfigs,
	type InputFieldType,
	type ViewFieldType,
} from 'packages/core/src/config/FieldConfigs';
import { type UnvalidatedInputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';

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

	invalid: '',
};

export const VIEW_FIELD_EXAMPLE_DECLARATIONS: Record<ViewFieldType, string> = {
	math: 'VIEW[{exampleProperty} + 2][math]',
	text: 'VIEW[some text {exampleProperty}][text]',
	link: 'VIEW[{exampleProperty}][link]',

	invalid: '',
};

export function createInputFieldFAQExamples(plugin: IPlugin): [InputFieldType, UnvalidatedInputFieldDeclaration][] {
	const ret: [InputFieldType, UnvalidatedInputFieldDeclaration][] = [];
	for (const [type, declaration] of Object.entries(INPUT_FIELD_EXAMPLE_DECLARATIONS)) {
		if (declaration === '') {
			continue;
		}

		let parsedDeclaration = plugin.api.inputFieldParser.fromString(`INPUT[${declaration}]`);
		const overrides = plugin.api.inputFieldParser.fromSimpleDeclaration({
			inputFieldType: undefined,
			templateName: undefined,
			bindTarget: undefined,
			arguments: [
				{
					name: InputFieldArgumentType.SHOWCASE,
					value: ['true'],
				},
				{
					name: InputFieldArgumentType.TITLE,
					value: [type],
				},
			],
		});

		parsedDeclaration = plugin.api.inputFieldParser.merge(parsedDeclaration, overrides);

		ret.push([type as InputFieldType, parsedDeclaration]);
	}
	return ret;
}

export function createInputFieldInsertExamples(_plugin: IPlugin): [string, string][] {
	const ret: [string, string][] = [];
	for (const [type, declaration] of Object.entries(INPUT_FIELD_EXAMPLE_DECLARATIONS)) {
		if (declaration === '') {
			continue;
		}
		const ipfType = type as InputFieldType;

		let fullDeclaration = '';

		if (InputFieldConfigs[ipfType].allowInline) {
			fullDeclaration = `\`INPUT[${declaration}:exampleProperty]\``;
		} else {
			fullDeclaration = `\n\`\`\`meta-bind\nINPUT[${declaration}:exampleProperty]\n\`\`\`\n`;
		}

		ret.push([ipfType, fullDeclaration]);
	}

	ret.sort((a, b) => a[0].localeCompare(b[0]));

	return ret;
}

export function createViewFieldInsertExamples(_plugin: IPlugin): [string, string][] {
	const ret: [string, string][] = [];
	for (const [type, declaration] of Object.entries(VIEW_FIELD_EXAMPLE_DECLARATIONS)) {
		if (declaration === '') {
			continue;
		}
		const vfType = type as ViewFieldType;

		const fullDeclaration = `\`${declaration}\``;

		ret.push([vfType, fullDeclaration]);
	}

	ret.push(['markdown', `\`VIEW[**some markdown** {exampleProperty}][text(renderMarkdown)]\``]);

	ret.sort((a, b) => a[0].localeCompare(b[0]));

	return ret;
}
