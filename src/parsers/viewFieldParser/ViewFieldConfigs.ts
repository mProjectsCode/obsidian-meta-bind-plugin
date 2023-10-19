import { FieldArgumentConfig } from '../GeneralConfigs';

export enum ViewFieldType {
	MATH = 'math',
	TEXT = 'text',

	INVALID = 'invalid',
}

export enum ViewFieldArgumentType {
	RENDER_MARKDOWN = 'renderMarkdown',
	HIDDEN = 'hidden',

	INVALID = 'invalid',
}

export type ViewFieldArgumentConfig = FieldArgumentConfig<ViewFieldArgumentType, ViewFieldType>;

export const ViewFieldArgumentConfigs: Record<ViewFieldArgumentType, ViewFieldArgumentConfig> = {
	[ViewFieldArgumentType.RENDER_MARKDOWN]: {
		type: ViewFieldArgumentType.RENDER_MARKDOWN,
		allowedFieldTypes: [ViewFieldType.TEXT],
		values: [
			[],
			[
				{
					name: 'value',
					allowed: ['true', 'false'],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},
	[ViewFieldArgumentType.HIDDEN]: {
		type: ViewFieldArgumentType.HIDDEN,
		allowedFieldTypes: [],
		values: [
			[],
			[
				{
					name: 'value',
					allowed: ['true', 'false'],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},
	[ViewFieldArgumentType.INVALID]: {
		type: ViewFieldArgumentType.INVALID,
		allowedFieldTypes: [],
		values: [[]],
		allowMultiple: true,
	},
};
