import { type InputFieldDeclarationParser } from '../parsers/inputFieldParser/InputFieldParser';
import { type ViewFieldParser } from '../parsers/viewFieldParser/ViewFieldParser';
import { type BindTargetParser } from '../parsers/BindTargetParser';
import { type IPlugin } from '../IPlugin';
import { type InputFieldAPI } from './InputFieldAPI';
import { type InputFieldFactory } from '../fields/inputFields/InputFieldFactory';
import { type ButtonActionRunner } from '../button/ButtonActionRunner';
import { type ButtonManager } from '../button/ButtonManager';

export interface IAPI {
	readonly plugin: IPlugin;
	/*
	 * The API for creating and modifying input field declarations.
	 */
	readonly inputField: InputFieldAPI;

	/**
	 * Parser for input field declarations.
	 */
	readonly inputFieldParser: InputFieldDeclarationParser;
	/**
	 * Parser for view field declarations.
	 */
	readonly viewFieldParser: ViewFieldParser;
	/**
	 * Parser for bind target declarations.
	 */
	readonly bindTargetParser: BindTargetParser;

	readonly inputFieldFactory: InputFieldFactory;

	readonly buttonActionRunner: ButtonActionRunner;
	readonly buttonManager: ButtonManager;
}
