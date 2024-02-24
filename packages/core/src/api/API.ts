import { type IPlugin } from 'packages/core/src/IPlugin';
import { SyntaxHighlightingAPI } from 'packages/core/src/api/SyntaxHighlightingAPI';
import { RenderChildType } from 'packages/core/src/config/FieldConfigs';
import { type FieldBase } from 'packages/core/src/fields/FieldBase';
import { ButtonActionRunner } from 'packages/core/src/fields/button/ButtonActionRunner';
import { ButtonBase } from 'packages/core/src/fields/button/ButtonBase';
import { ButtonManager } from 'packages/core/src/fields/button/ButtonManager';
import { InlineButtonBase } from 'packages/core/src/fields/button/InlineButtonBase';
import { InputFieldBase } from 'packages/core/src/fields/inputFields/InputFieldBase';
import { InputFieldFactory } from 'packages/core/src/fields/inputFields/InputFieldFactory';
import { JsViewField } from 'packages/core/src/fields/viewFields/JsViewField';
import { ViewFieldBase } from 'packages/core/src/fields/viewFields/ViewFieldBase';
import { ViewFieldFactory } from 'packages/core/src/fields/viewFields/ViewFieldFactory';
import type { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { BindTargetParser } from 'packages/core/src/parsers/bindTargetParser/BindTargetParser';
import { InputFieldParser } from 'packages/core/src/parsers/inputFieldParser/InputFieldParser';
import { ViewFieldParser } from 'packages/core/src/parsers/viewFieldParser/ViewFieldParser';
import { expectType, getUUID } from 'packages/core/src/utils/Utils';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { EmbedBase } from 'packages/core/src/fields/embed/EmbedBase';
import { ExcludedBase } from 'packages/core/src/fields/excluded/ExcludedBase';
import {
	type InputFieldDeclaration,
	type SimpleInputFieldDeclaration,
} from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import {
	type JsViewFieldDeclaration,
	type SimpleJsViewFieldDeclaration,
	type SimpleViewFieldDeclaration,
	type ViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { type ButtonConfig } from 'packages/core/src/config/ButtonConfig';
import {
	type ButtonDeclaration,
	ButtonParser,
	type InlineButtonDeclaration,
	type SimpleInlineButtonDeclaration,
} from 'packages/core/src/parsers/ButtonParser';
import { JsViewFieldParser } from 'packages/core/src/parsers/viewFieldParser/JsViewFieldParser';

export enum FieldType {
	INPUT_FIELD = 'INPUT_FIELD',
	VIEW_FIELD = 'VIEW_FIELD',
	JS_VIEW_FIELD = 'JS_VIEW_FIELD',
	INLINE_BUTTON = 'INLINE_BUTTON',
	BUTTON = 'BUTTON',
	EMBED = 'EMBED',
	EXCLUDED = 'EXCLUDED',
}

export interface InputFieldOptions {
	renderChildType: RenderChildType;
	declaration: SimpleInputFieldDeclaration | string;
	scope: BindTargetScope | undefined;
}

export interface ViewFieldOptions {
	renderChildType: RenderChildType;
	declaration: SimpleViewFieldDeclaration | string;
	scope: BindTargetScope | undefined;
}

export interface JsViewFieldOptions {
	declaration: SimpleJsViewFieldDeclaration | string;
}

export interface InlineButtonOptions {
	declaration: SimpleInlineButtonDeclaration | string;
}

export interface ButtonOptions {
	declaration: ButtonConfig | string;
	isPreview: boolean;
}

export interface EmbedOptions {
	depth: number;
	content: string;
}

export interface FieldOptionMap {
	[FieldType.INPUT_FIELD]: InputFieldOptions;
	[FieldType.VIEW_FIELD]: ViewFieldOptions;
	[FieldType.JS_VIEW_FIELD]: JsViewFieldOptions;
	[FieldType.INLINE_BUTTON]: InlineButtonOptions;
	[FieldType.BUTTON]: ButtonOptions;
	[FieldType.EMBED]: EmbedOptions;
	[FieldType.EXCLUDED]: undefined;
}

export type InlineFieldType = FieldType.INPUT_FIELD | FieldType.VIEW_FIELD | FieldType.INLINE_BUTTON;

export function isFieldTypeAllowedInline(type: FieldType): type is InlineFieldType {
	return type === FieldType.INPUT_FIELD || type === FieldType.VIEW_FIELD || type === FieldType.INLINE_BUTTON;
}

export interface APIFieldOverrides {
	inputFieldParser?: InputFieldParser;
	viewFieldParser?: ViewFieldParser;
	jsViewFieldParser?: JsViewFieldParser;
	buttonParser?: ButtonParser;
	bindTargetParser?: BindTargetParser;
	inputFieldFactory?: InputFieldFactory;
	viewFieldFactory?: ViewFieldFactory;
	buttonActionRunner?: ButtonActionRunner;
	buttonManager?: ButtonManager;
	syntaxHighlighting?: SyntaxHighlightingAPI;
}

export abstract class API<Plugin extends IPlugin> {
	readonly plugin: Plugin;

	readonly inputFieldParser: InputFieldParser;
	readonly viewFieldParser: ViewFieldParser;
	readonly jsViewFieldParser: JsViewFieldParser;
	readonly buttonParser: ButtonParser;
	readonly bindTargetParser: BindTargetParser;

	readonly inputFieldFactory: InputFieldFactory;
	readonly viewFieldFactory: ViewFieldFactory;

	readonly buttonActionRunner: ButtonActionRunner;
	readonly buttonManager: ButtonManager;

	readonly syntaxHighlighting: SyntaxHighlightingAPI;

	constructor(plugin: Plugin, overrides?: APIFieldOverrides) {
		this.plugin = plugin;

		this.inputFieldParser = overrides?.inputFieldParser ?? new InputFieldParser(plugin);
		this.viewFieldParser = overrides?.viewFieldParser ?? new ViewFieldParser(plugin);
		this.jsViewFieldParser = overrides?.jsViewFieldParser ?? new JsViewFieldParser(plugin);
		this.buttonParser = overrides?.buttonParser ?? new ButtonParser(plugin);
		this.bindTargetParser = overrides?.bindTargetParser ?? new BindTargetParser(plugin);

		this.inputFieldFactory = overrides?.inputFieldFactory ?? new InputFieldFactory(plugin);
		this.viewFieldFactory = overrides?.viewFieldFactory ?? new ViewFieldFactory(plugin);

		this.buttonActionRunner = overrides?.buttonActionRunner ?? new ButtonActionRunner(plugin);
		this.buttonManager = overrides?.buttonManager ?? new ButtonManager(plugin);

		this.syntaxHighlighting = overrides?.syntaxHighlighting ?? new SyntaxHighlightingAPI(plugin);
	}

	/**
	 * Creates a field of a given type.
	 *
	 * @param type
	 * @param filePath
	 * @param options
	 * @param honorExcludedSetting
	 */
	public createField<Type extends FieldType>(
		type: Type,
		filePath: string,
		options: FieldOptionMap[Type],
		honorExcludedSetting: boolean = true,
	): FieldBase {
		if (this.plugin.internal.isFilePathExcluded(filePath) && honorExcludedSetting) {
			return this.createExcludedBase(filePath);
		}

		if (type === FieldType.INPUT_FIELD) {
			return this.createInputFieldBase(filePath, options as FieldOptionMap[FieldType.INPUT_FIELD]);
		} else if (type === FieldType.VIEW_FIELD) {
			return this.createViewFieldBase(filePath, options as FieldOptionMap[FieldType.VIEW_FIELD]);
		} else if (type === FieldType.JS_VIEW_FIELD) {
			return this.createJsViewFieldBase(filePath, options as FieldOptionMap[FieldType.JS_VIEW_FIELD]);
		} else if (type === FieldType.INLINE_BUTTON) {
			return this.createInlineButtonBase(filePath, options as FieldOptionMap[FieldType.INLINE_BUTTON]);
		} else if (type === FieldType.BUTTON) {
			return this.createButtonBase(filePath, options as FieldOptionMap[FieldType.BUTTON]);
		} else if (type === FieldType.EMBED) {
			return this.createEmbedBase(filePath, options as FieldOptionMap[FieldType.EMBED]);
		} else if (type === FieldType.EXCLUDED) {
			return this.createExcludedBase(filePath);
		}

		expectType<never>(type);

		// TODO: Nice error message
		throw new Error(`Unknown field type: ${type}`);
	}

	/**
	 * Creates an inline field from a string.
	 * Will throw an error if the string is not a valid declaration.
	 *
	 * @param fieldString
	 * @param filePath
	 * @param scope
	 * @param renderChildType
	 * @param honorExcludedSetting
	 */
	public createInlineFieldFromString(
		fieldString: string,
		filePath: string,
		scope: BindTargetScope | undefined,
		renderChildType: RenderChildType = RenderChildType.INLINE,
		honorExcludedSetting: boolean = true,
	): FieldBase {
		const fieldType = this.isInlineFieldDeclarationAndGetType(fieldString);
		if (fieldType === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'failed to create inline field',
				cause: `Invalid inline mdrc type "${fieldType}"`,
			});
		}

		return this.createInlineFieldOfTypeFromString(
			fieldType,
			fieldString,
			filePath,
			scope,
			renderChildType,
			honorExcludedSetting,
		);
	}

	/**
	 * Creates an inline field of a given type and string.
	 * Will throw an error if the string is not a valid inline field type.
	 *
	 * @param type
	 * @param filePath
	 * @param declaration
	 * @param scope
	 * @param renderChildType
	 * @param honorExcludedSetting
	 */
	public createInlineFieldOfTypeFromString(
		type: InlineFieldType,
		declaration: string,
		filePath: string,
		scope: BindTargetScope | undefined,
		renderChildType: RenderChildType = RenderChildType.INLINE,
		honorExcludedSetting: boolean = true,
	): FieldBase {
		if (this.plugin.internal.isFilePathExcluded(filePath) && honorExcludedSetting) {
			return this.createExcludedBase(filePath);
		}

		if (type === FieldType.INPUT_FIELD) {
			return this.createInputFieldBase(filePath, {
				renderChildType: renderChildType,
				declaration: declaration,
				scope: scope,
			});
		}

		if (type === FieldType.VIEW_FIELD) {
			return this.createViewFieldBase(filePath, {
				renderChildType: renderChildType,
				declaration: declaration,
				scope: scope,
			});
		}

		if (type === FieldType.INLINE_BUTTON) {
			return this.createInlineButtonBase(filePath, { declaration: declaration });
		}

		expectType<never>(type);

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to create inline field',
			cause: `Invalid inline mdrc type "${type}"`,
		});
	}

	public createInputFieldBase(filePath: string, options: InputFieldOptions): InputFieldBase {
		const uuid = getUUID();

		let declaration: InputFieldDeclaration;
		if (typeof options.declaration === 'string') {
			declaration = this.inputFieldParser.fromStringAndValidate(options.declaration, filePath, options.scope);
		} else {
			declaration = this.inputFieldParser.fromSimpleDeclarationAndValidate(
				options.declaration,
				filePath,
				options.scope,
			);
		}

		return new InputFieldBase(this.plugin, uuid, filePath, options.renderChildType, declaration);
	}

	public createViewFieldBase(filePath: string, options: ViewFieldOptions): ViewFieldBase {
		const uuid = getUUID();

		let declaration: ViewFieldDeclaration;
		if (typeof options.declaration === 'string') {
			declaration = this.viewFieldParser.fromStringAndValidate(options.declaration, filePath, options.scope);
		} else {
			declaration = this.viewFieldParser.fromSimpleDeclarationAndValidate(
				options.declaration,
				filePath,
				options.scope,
			);
		}

		return new ViewFieldBase(this.plugin, uuid, filePath, options.renderChildType, declaration);
	}

	public createJsViewFieldBase(filePath: string, options: JsViewFieldOptions): JsViewField {
		const uuid = getUUID();

		let declaration: JsViewFieldDeclaration;
		if (typeof options.declaration === 'string') {
			declaration = this.jsViewFieldParser.fromStringAndValidate(options.declaration, filePath);
		} else {
			declaration = this.jsViewFieldParser.fromSimpleDeclarationAndValidate(options.declaration, filePath);
		}

		return new JsViewField(this.plugin, uuid, filePath, declaration);
	}

	public createInlineButtonBase(filePath: string, options: InlineButtonOptions): InlineButtonBase {
		const uuid = getUUID();

		let declaration: InlineButtonDeclaration;
		if (typeof options.declaration === 'string') {
			declaration = this.buttonParser.parseInlineString(options.declaration);
		} else {
			declaration = this.buttonParser.validateSimpleInlineDeclaration(options.declaration);
		}

		return new InlineButtonBase(this.plugin, uuid, filePath, declaration);
	}

	public createButtonBase(filePath: string, options: ButtonOptions): ButtonBase {
		const uuid = getUUID();

		let declaration: ButtonDeclaration;
		if (typeof options.declaration === 'string') {
			declaration = this.buttonParser.parseButtonString(options.declaration);
		} else {
			declaration = this.buttonParser.validateSimpleButtonConfig(options.declaration);
		}

		return new ButtonBase(this.plugin, uuid, filePath, declaration, options.isPreview);
	}

	public createEmbedBase(filePath: string, options: EmbedOptions): EmbedBase {
		const uuid = getUUID();
		return new EmbedBase(this.plugin, uuid, filePath, options.depth, options.content);
	}

	public createExcludedBase(filePath: string): ExcludedBase {
		const uuid = getUUID();
		return new ExcludedBase(this.plugin, uuid, filePath);
	}

	/**
	 * Gets the prefix of a given widget type. (e.g. INPUT or VIEW)
	 *
	 * @param fieldType
	 */
	public getInlineFieldDeclarationPrefix(fieldType: FieldType): string {
		if (fieldType === FieldType.INPUT_FIELD) {
			return 'INPUT';
		} else if (fieldType === FieldType.VIEW_FIELD) {
			return 'VIEW';
		} else if (fieldType === FieldType.INLINE_BUTTON) {
			return 'BUTTON';
		}

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to get declaration prefix',
			cause: `Invalid inline mdrc type "${fieldType}"`,
		});
	}

	/**
	 * Checks if a string is a declaration of a given widget type.
	 *
	 * @param fieldType
	 * @param str
	 */
	public isInlineFieldDeclaration(fieldType: FieldType, str: string): boolean {
		const startStr: string = this.getInlineFieldDeclarationPrefix(fieldType) + '[';
		const endStr: string = ']';

		return str.startsWith(startStr) && str.endsWith(endStr);
	}

	/**
	 * Checks if a string is any declaration and if yes returns the widget type.
	 * This does not use {@link isInlineFieldDeclaration} because of performance reasons.
	 *
	 * @param str
	 */
	public isInlineFieldDeclarationAndGetType(str: string): InlineFieldType | undefined {
		if (!str.endsWith(']')) {
			return undefined;
		}

		for (const widgetType of Object.values(FieldType)) {
			if (!isFieldTypeAllowedInline(widgetType)) {
				continue;
			}
			const startStr: string = this.getInlineFieldDeclarationPrefix(widgetType) + '[';
			if (str.startsWith(startStr)) {
				return widgetType;
			}
		}

		return undefined;
	}
}
