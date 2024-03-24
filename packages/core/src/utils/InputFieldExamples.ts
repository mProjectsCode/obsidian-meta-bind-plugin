import { type IPlugin } from 'packages/core/src/IPlugin';
import {
	InputFieldArgumentType,
	InputFieldConfigs,
	type InputFieldType,
	type ViewFieldType,
} from 'packages/core/src/config/FieldConfigs';
import { type InputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';

export const INPUT_FIELD_EXAMPLE_DECLARATIONS: Record<InputFieldType, string> = {
	date: 'date',
	datePicker: 'datePicker',
	dateTime: 'dateTime',
	editor: 'editor',
	imageSuggester: 'imageSuggester(optionQuery(""))',
	imageListSuggester: 'imageListSuggester(optionQuery(""))',
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

export interface ViewFieldExampleDeclaration {
	title: string;
	declaration: string;
	display: string;
	inputField: string;
}

export const VIEW_FIELD_EXAMPLE_DECLARATIONS: Record<ViewFieldType, ViewFieldExampleDeclaration[]> = {
	image: [
		{
			title: 'Image',
			declaration: 'VIEW[{globalMemory^MB_VF_image_example}][image]',
			display: 'VIEW[{imageExampleProperty}][image]',
			inputField: 'INPUT[imageSuggester(optionQuery("")):globalMemory^MB_VF_image_example]',
		},
	],
	link: [
		{
			title: 'Link',
			declaration: 'VIEW[{globalMemory^MB_VF_link_example}][link]',
			display: 'VIEW[{linkExampleProperty}][link]',
			inputField: 'INPUT[suggester(optionQuery("")):globalMemory^MB_VF_link_example]',
		},
	],
	math: [
		{
			title: 'Math',
			declaration: 'VIEW[{globalMemory^MB_VF_math_example} + 2][math]',
			display: 'VIEW[{mathExampleProperty} + 2][math]',
			inputField: 'INPUT[number:globalMemory^MB_VF_math_example]',
		},
	],
	text: [
		{
			title: 'Text',
			declaration: 'VIEW[some text {globalMemory^MB_VF_text_example}][text]',
			display: 'VIEW[some text {textExampleProperty}][text]',
			inputField: 'INPUT[text:globalMemory^MB_VF_text_example]',
		},
		{
			title: 'Markdown',
			declaration: 'VIEW[**some markdown** {globalMemory^MB_VF_text_markdown_example}][text(renderMarkdown)]',
			display: 'VIEW[**some markdown** {markdownExampleProperty}][text(renderMarkdown)]',
			inputField: 'INPUT[text:globalMemory^MB_VF_text_markdown_example]',
		},
	],

	invalid: [],
};

export function createInputFieldFAQExamples(plugin: IPlugin): [InputFieldType, InputFieldDeclaration][] {
	const ret: [InputFieldType, InputFieldDeclaration][] = [];
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
		parsedDeclaration.declarationString = `INPUT[${declaration}]`;
		const validatedDeclaration = plugin.api.inputFieldParser.validate(parsedDeclaration, '', undefined);

		ret.push([type as InputFieldType, validatedDeclaration]);
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
	for (const declarations of Object.values(VIEW_FIELD_EXAMPLE_DECLARATIONS)) {
		for (const declaration of declarations) {
			ret.push([declaration.title, `\`${declaration.display}\``]);
		}
	}

	ret.sort((a, b) => a[0].localeCompare(b[0]));

	return ret;
}
