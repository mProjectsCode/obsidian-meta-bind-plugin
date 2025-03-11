import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';

export const monthNames = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export interface Weekday {
	index: number;
	name: string;
	shortName: string;
}

export const weekdays: Weekday[] = [
	{
		index: 0,
		name: 'Sunday',
		shortName: 'Su',
	},
	{
		index: 1,
		name: 'Monday',
		shortName: 'Mo',
	},
	{
		index: 2,
		name: 'Tuesday',
		shortName: 'Tu',
	},
	{
		index: 3,
		name: 'Wednesday',
		shortName: 'We',
	},
	{
		index: 4,
		name: 'Thursday',
		shortName: 'Th',
	},
	{
		index: 5,
		name: 'Friday',
		shortName: 'Fr',
	},
	{
		index: 6,
		name: 'Saturday',
		shortName: 'Sa',
	},
];

export interface MetaBindPluginSettings {
	devMode: boolean;
	ignoreCodeBlockRestrictions: boolean;
	preferredDateFormat: string;
	firstWeekday: Weekday;
	syncInterval: number;
	enableJs: boolean;
	viewFieldDisplayNullAsEmpty: boolean;
	enableSyntaxHighlighting: boolean;
	enableEditorRightClickMenu: boolean;

	inputFieldTemplates: InputFieldTemplate[];
	buttonTemplates: ButtonConfig[];
	excludedFolders: string[];
}

export interface InputFieldTemplate {
	name: string;
	declaration: string;
}

export const DEFAULT_SETTINGS: MetaBindPluginSettings = {
	devMode: false,
	ignoreCodeBlockRestrictions: false,
	preferredDateFormat: 'YYYY-MM-DD',
	firstWeekday: weekdays[1],
	syncInterval: 200,
	enableJs: false,
	viewFieldDisplayNullAsEmpty: false,
	enableSyntaxHighlighting: true,
	enableEditorRightClickMenu: true,

	inputFieldTemplates: [],
	buttonTemplates: [],
	excludedFolders: ['templates'],
};

export const MIN_SYNC_INTERVAL = 50;
export const MAX_SYNC_INTERVAL = 1000;
