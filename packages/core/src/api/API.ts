import type { ImportObject as MathJSImportObject, ImportOptions as MathJSImportOptions } from 'mathjs';
import type {
	ButtonGroupOptions,
	ButtonOptions,
	EmbedOptions,
	FieldOptionMap,
	InlineFieldType,
	InputFieldOptions,
	JsViewFieldOptions,
	TableOptions,
	ViewFieldOptions,
} from 'packages/core/src/config/APIConfigs';
import {
	FieldType,
	isFieldTypeAllowedInline,
	NotePosition,
	RenderChildType,
} from 'packages/core/src/config/APIConfigs';
import {
	V_BindTargetDeclaration,
	V_BindTargetScope,
	V_ButtonOptions,
	V_EmbedOptions,
	V_FieldType,
	V_FilePath,
	V_InlineButtonOptions,
	V_InputFieldOptions,
	V_JsViewFieldOptions,
	V_RenderChildType,
	V_TableFieldOptions,
	V_ViewFieldOptions,
} from 'packages/core/src/config/validators/Validators';
import { ButtonGroupMountable } from 'packages/core/src/fields/button/ButtonGroupMountable';
import { ButtonMountable } from 'packages/core/src/fields/button/ButtonMountable';
import { EmbedMountable } from 'packages/core/src/fields/embed/EmbedMountable';
import { ExcludedMountable } from 'packages/core/src/fields/excluded/ExcludedMountable';
import type { FieldMountable } from 'packages/core/src/fields/FieldMountable';
import { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
import { TableMountable } from 'packages/core/src/fields/metaBindTable/TableMountable';
import { JsViewFieldMountable } from 'packages/core/src/fields/viewFields/JsViewFieldMountable';
import { ViewFieldMountable } from 'packages/core/src/fields/viewFields/ViewFieldMountable';
import type { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { ButtonDeclaration, ButtonGroupDeclaration } from 'packages/core/src/parsers/ButtonParser';
import type { InputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import type {
	JsViewFieldDeclaration,
	ViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { parsePropPath } from 'packages/core/src/utils/prop/PropParser';
import { Signal } from 'packages/core/src/utils/Signal';
import { expectType, getUUID } from 'packages/core/src/utils/Utils';
import { validateAPIArgs, zodFunction } from 'packages/core/src/utils/ZodUtils';
import { z } from 'zod';
import type { MB_Comps, MetaBind } from '..';

export interface LifecycleHook {
	register(cb: () => void): void;
}

export abstract class API<Components extends MB_Comps> {
	readonly mb: MetaBind<Components>;

	constructor(mb: MetaBind<Components>) {
		this.mb = mb;
	}

	/**
	 * Creates a field of a given type.
	 *
	 * @param type the type of the field
	 * @param filePath the file path that the field is located in, or an empty string if it is not in a file
	 * @param options
	 * @param honorExcludedSetting whether to honor the excluded folders settings for this field
	 */
	public createField<Type extends FieldType>(
		type: Type,
		filePath: string,
		options: FieldOptionMap[Type],
		honorExcludedSetting: boolean = true,
	): FieldMountable {
		validateAPIArgs(
			z.object({
				type: V_FieldType,
				filePath: V_FilePath,
				options: z.any(),
				honorExcludedSetting: z.boolean(),
			}),
			{
				type: type,
				filePath: filePath,
				options: options,
				honorExcludedSetting: honorExcludedSetting,
			},
		);

		if (this.mb.file.isExcludedFromRendering(filePath) && honorExcludedSetting) {
			return this.createExcludedMountable(filePath);
		}

		if (type === FieldType.INPUT) {
			return this.createInputFieldMountable(filePath, options as FieldOptionMap[FieldType.INPUT]);
		} else if (type === FieldType.VIEW) {
			return this.createViewFieldMountable(filePath, options as FieldOptionMap[FieldType.VIEW]);
		} else if (type === FieldType.JS_VIEW) {
			return this.createJsViewFieldMountable(filePath, options as FieldOptionMap[FieldType.JS_VIEW]);
		} else if (type === FieldType.TABLE) {
			return this.createTableMountable(filePath, options as FieldOptionMap[FieldType.TABLE]);
		} else if (type === FieldType.BUTTON_GROUP) {
			return this.createButtonGroupMountable(filePath, options as FieldOptionMap[FieldType.BUTTON_GROUP]);
		} else if (type === FieldType.BUTTON) {
			return this.createButtonMountable(filePath, options as FieldOptionMap[FieldType.BUTTON]);
		} else if (type === FieldType.EMBED) {
			return this.createEmbedMountable(filePath, options as FieldOptionMap[FieldType.EMBED]);
		} else if (type === FieldType.EXCLUDED) {
			return this.createExcludedMountable(filePath);
		}

		expectType<never>(type);

		// TODO: Nice error message
		throw new Error(`Unknown field type: ${type}`);
	}

	/**
	 * Creates an inline field from a string.
	 * Will throw an error if the string is not a valid declaration.
	 *
	 * @param fieldString the declaration string of the field
	 * @param filePath the file path that the field is located in
	 * @param scope optional bind target scope
	 * @param renderChildType the render child type, default INLINE
	 * @param position an optional note position
	 * @param honorExcludedSetting whether to honor the excluded folders settings for this field
	 */
	public createInlineFieldFromString(
		fieldString: string,
		filePath: string,
		scope: BindTargetScope | undefined,
		renderChildType: RenderChildType = RenderChildType.INLINE,
		position?: NotePosition,
		honorExcludedSetting: boolean = true,
	): FieldMountable {
		validateAPIArgs(
			z.object({
				fieldString: z.string(),
				filePath: V_FilePath,
				scope: V_BindTargetScope.optional(),
				renderChildType: V_RenderChildType,
				honorExcludedSetting: z.boolean(),
			}),
			{
				fieldString: fieldString,
				filePath: filePath,
				scope: scope,
				renderChildType: renderChildType,
				honorExcludedSetting: honorExcludedSetting,
			},
		);

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
			position,
			honorExcludedSetting,
		);
	}

	/**
	 * Creates an inline field of a given type and string.
	 * Will throw an error if the string is not a valid inline field type.
	 *
	 * @param type the field type
	 * @param declaration the declaration string of the field
	 * @param filePath the file path that the field is located in
	 * @param scope optional bind target scope
	 * @param renderChildType the render child type, default INLINE
	 * @param position an optional note position
	 * @param honorExcludedSetting whether to honor the excluded folders settings for this field
	 */
	public createInlineFieldOfTypeFromString(
		type: InlineFieldType,
		declaration: string,
		filePath: string,
		scope: BindTargetScope | undefined,
		renderChildType: RenderChildType = RenderChildType.INLINE,
		position?: NotePosition,
		honorExcludedSetting: boolean = true,
	): FieldMountable {
		validateAPIArgs(
			z.object({
				type: V_FieldType,
				declaration: z.string(),
				filePath: V_FilePath,
				scope: V_BindTargetScope.optional(),
				renderChildType: V_RenderChildType,
				honorExcludedSetting: z.boolean(),
			}),
			{
				type: type,
				declaration: declaration,
				filePath: filePath,
				scope: scope,
				renderChildType: renderChildType,
				honorExcludedSetting: honorExcludedSetting,
			},
		);

		if (this.mb.file.isExcludedFromRendering(filePath) && honorExcludedSetting) {
			return this.createExcludedMountable(filePath);
		}

		if (type === FieldType.INPUT) {
			return this.createInputFieldMountable(filePath, {
				renderChildType: renderChildType,
				declaration: declaration,
				scope: scope,
			});
		}

		if (type === FieldType.VIEW) {
			return this.createViewFieldMountable(filePath, {
				renderChildType: renderChildType,
				declaration: declaration,
				scope: scope,
			});
		}

		if (type === FieldType.BUTTON_GROUP) {
			return this.createButtonGroupMountable(filePath, {
				renderChildType: renderChildType,
				declaration: declaration,
				position: position,
			});
		}

		expectType<never>(type);

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to create inline field',
			cause: `Invalid inline mdrc type "${type}"`,
		});
	}

	/**
	 * Creates an input field from an options object.
	 *
	 * @param filePath the file path that the field is located in or an empty string
	 * @param options
	 */
	public createInputFieldMountable(filePath: string, options: InputFieldOptions): InputFieldMountable {
		validateAPIArgs(
			z.object({
				filePath: V_FilePath,
				options: V_InputFieldOptions,
			}),
			{
				filePath: filePath,
				options: options,
			},
		);

		const uuid = getUUID();

		let declaration: InputFieldDeclaration;
		if (typeof options.declaration === 'string') {
			declaration = this.mb.inputFieldParser.fromStringAndValidate(options.declaration, filePath, options.scope);
		} else {
			declaration = this.mb.inputFieldParser.fromSimpleDeclarationAndValidate(
				options.declaration,
				filePath,
				options.scope,
			);
		}

		return new InputFieldMountable(this.mb, uuid, filePath, options.renderChildType, declaration);
	}

	/**
	 * Creates a view field from an options object.
	 *
	 * @param filePath the file path that the field is located in or an empty string
	 * @param options
	 */
	public createViewFieldMountable(filePath: string, options: ViewFieldOptions): ViewFieldMountable {
		validateAPIArgs(
			z.object({
				filePath: V_FilePath,
				options: V_ViewFieldOptions,
			}),
			{
				filePath: filePath,
				options: options,
			},
		);

		const uuid = getUUID();

		let declaration: ViewFieldDeclaration;
		if (typeof options.declaration === 'string') {
			declaration = this.mb.viewFieldParser.fromStringAndValidate(options.declaration, filePath, options.scope);
		} else {
			declaration = this.mb.viewFieldParser.fromSimpleDeclarationAndValidate(
				options.declaration,
				filePath,
				options.scope,
			);
		}

		return new ViewFieldMountable(this.mb, uuid, filePath, options.renderChildType, declaration);
	}

	/**
	 * Creates a JS view field from an options object.
	 *
	 * @param filePath the file path that the field is located in or an empty string
	 * @param options
	 */
	public createJsViewFieldMountable(filePath: string, options: JsViewFieldOptions): JsViewFieldMountable {
		validateAPIArgs(
			z.object({
				filePath: V_FilePath,
				options: V_JsViewFieldOptions,
			}),
			{
				filePath: filePath,
				options: options,
			},
		);

		const uuid = getUUID();

		let declaration: JsViewFieldDeclaration;
		if (typeof options.declaration === 'string') {
			declaration = this.mb.jsViewFieldParser.fromStringAndValidate(options.declaration, filePath);
		} else {
			declaration = this.mb.jsViewFieldParser.fromSimpleDeclarationAndValidate(options.declaration, filePath);
		}

		return new JsViewFieldMountable(this.mb, uuid, filePath, declaration);
	}

	/**
	 * Creates a table from an options object.
	 *
	 * @param filePath the file path that the field is located in or an empty string
	 * @param options
	 */
	public createTableMountable(filePath: string, options: TableOptions): TableMountable {
		validateAPIArgs(
			z.object({
				filePath: V_FilePath,
				options: V_TableFieldOptions,
			}),
			{
				filePath: filePath,
				options: options,
			},
		);

		const uuid = getUUID();

		return new TableMountable(this.mb, uuid, filePath, options.bindTarget, options.tableHead, options.columns);
	}

	/**
	 * Creates a button group from an options object.
	 *
	 * @param filePath the file path that the field is located in or an empty string
	 * @param options
	 */
	public createButtonGroupMountable(filePath: string, options: ButtonGroupOptions): ButtonGroupMountable {
		validateAPIArgs(
			z.object({
				filePath: V_FilePath,
				options: V_InlineButtonOptions,
			}),
			{
				filePath: filePath,
				options: options,
			},
		);

		const uuid = getUUID();

		let declaration: ButtonGroupDeclaration;
		if (typeof options.declaration === 'string') {
			declaration = this.mb.buttonParser.fromGroupString(options.declaration);
		} else {
			declaration = this.mb.buttonParser.validateGroup(options.declaration);
		}

		return new ButtonGroupMountable(
			this.mb,
			uuid,
			filePath,
			declaration,
			options.renderChildType,
			options.position,
		);
	}

	/**
	 * Creates a button from an options object.
	 *
	 * @param filePath the file path that the field is located in or an empty string
	 * @param options
	 */
	public createButtonMountable(filePath: string, options: ButtonOptions): ButtonMountable {
		validateAPIArgs(
			z.object({
				filePath: V_FilePath,
				options: V_ButtonOptions,
			}),
			{
				filePath: filePath,
				options: options,
			},
		);

		const uuid = getUUID();

		let declaration: ButtonDeclaration;
		if (typeof options.declaration === 'string') {
			declaration = this.mb.buttonParser.fromString(options.declaration);
		} else {
			declaration = this.mb.buttonParser.validate(options.declaration);
		}

		return new ButtonMountable(this.mb, uuid, filePath, declaration, options.position, options.isPreview);
	}

	/**
	 * Creates a meta bind embed fields from an options object.
	 *
	 * @param filePath the file path that the field is located in or an empty string
	 * @param options
	 */
	public createEmbedMountable(filePath: string, options: EmbedOptions): EmbedMountable {
		validateAPIArgs(
			z.object({
				filePath: V_FilePath,
				options: V_EmbedOptions,
			}),
			{
				filePath: filePath,
				options: options,
			},
		);

		const uuid = getUUID();
		return new EmbedMountable(this.mb, uuid, filePath, options.depth, options.content);
	}

	/**
	 * Creates an excluded notification mountable for the excluded folders setting.
	 *
	 * @param filePath the file path that the field is located in or an empty string
	 */
	public createExcludedMountable(filePath: string): ExcludedMountable {
		validateAPIArgs(
			z.object({
				filePath: V_FilePath,
			}),
			{
				filePath: filePath,
			},
		);

		const uuid = getUUID();
		return new ExcludedMountable(this.mb, uuid, filePath);
	}

	/**
	 * Gets the prefix of a given widget type. (e.g. INPUT or VIEW).
	 *
	 * @param fieldType
	 */
	public getInlineFieldDeclarationPrefix(fieldType: FieldType): string {
		validateAPIArgs(
			z.object({
				fieldType: V_FieldType,
			}),
			{
				fieldType: fieldType,
			},
		);

		if (fieldType === FieldType.INPUT) {
			return 'INPUT';
		} else if (fieldType === FieldType.VIEW) {
			return 'VIEW';
		} else if (fieldType === FieldType.BUTTON_GROUP) {
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
	 * @param str the declaration string
	 */
	public isInlineFieldDeclaration(fieldType: FieldType, str: string): boolean {
		validateAPIArgs(
			z.object({
				fieldType: V_FieldType,
				str: z.string(),
			}),
			{
				fieldType: fieldType,
				str: str,
			},
		);

		const startStr: string = this.getInlineFieldDeclarationPrefix(fieldType) + '[';
		const endStr: string = ']';

		return str.startsWith(startStr) && str.endsWith(endStr);
	}

	/**
	 * Checks if a string is any declaration. If yes, it returns the widget type, otherwise undefined.
	 *
	 * @param str the declaration string
	 */
	public isInlineFieldDeclarationAndGetType(str: string): InlineFieldType | undefined {
		validateAPIArgs(
			z.object({
				str: z.string(),
			}),
			{
				str: str,
			},
		);

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

	/**
	 * Creates a signal.
	 *
	 * @param value
	 */
	public createSignal<T>(value: T): Signal<T> {
		return new Signal<T>(value);
	}

	/**
	 * Creates a bind target declaration.
	 *
	 * @param storageType the storage type (also named metadata source sometimes)
	 * @param storagePath the storage path (usually the file path)
	 * @param property the property access path as an array. E.g. for the path `cache.a.b.c`, the array would be `['a', 'b', 'c']`.
	 * @param listenToChildren whether to listen to children, only relevant for arrays and objects
	 */
	public createBindTarget(
		storageType: string,
		storagePath: string,
		property: string[],
		listenToChildren: boolean = false,
	): BindTargetDeclaration {
		validateAPIArgs(
			z.object({
				storageType: z.string(),
				storagePath: z.string(),
				property: z.string().array(),
				listenToChildren: z.boolean(),
			}),
			{
				storageType: storageType,
				storagePath: storagePath,
				property: property,
				listenToChildren: listenToChildren,
			},
		);

		return {
			storageType: storageType,
			storagePath: storagePath,
			storageProp: parsePropPath(property),
			listenToChildren: listenToChildren,
		};
	}

	/**
	 * Parses a bind target declaration from a string.
	 *
	 * @param declarationString the string to parse
	 * @param filePath the file path that this bind target is relative to
	 * @param scope optional bind target scope
	 */
	public parseBindTarget(
		declarationString: string,
		filePath: string,
		scope?: BindTargetScope,
	): BindTargetDeclaration {
		validateAPIArgs(
			z.object({
				declarationString: z.string(),
				filePath: V_FilePath,
				scope: V_BindTargetScope.optional(),
			}),
			{
				declarationString: declarationString,
				filePath: filePath,
				scope: scope,
			},
		);

		return this.mb.bindTargetParser.fromStringAndValidate(declarationString, filePath, scope);
	}

	/**
	 * Sets a property in meta binds metadata cache.
	 *
	 * @example
	 * // Assumes you use the JS Engine plugin to run this.
	 * const mb = engine.getPlugin("obsidian-meta-bind-plugin").api;
	 * const bindTarget = mb.parseBindTarget("property", context.file.path);
	 * mb.setMetadata(bindTarget, "some value");
	 *
	 * @param bindTarget
	 * @param value
	 */
	public setMetadata(bindTarget: BindTargetDeclaration, value: unknown): void {
		validateAPIArgs(
			z.object({
				bindTarget: V_BindTargetDeclaration,
			}),
			{
				bindTarget: bindTarget,
			},
		);

		this.mb.metadataManager.write(value, bindTarget);
	}

	/**
	 * Reads a property from meta binds metadata cache.
	 * If the value is not present in the cache, it will check the underlying source. E.g. Obsidians metadata cache.
	 *
	 * @example
	 * // Assumes you use the JS Engine plugin to run this.
	 * const mb = engine.getPlugin("obsidian-meta-bind-plugin").api;
	 * const bindTarget = mb.parseBindTarget("property", context.file.path);
	 * const value = mb.getMetadata(bindTarget);
	 *
	 * @param bindTarget
	 */
	public getMetadata(bindTarget: BindTargetDeclaration): unknown {
		validateAPIArgs(
			z.object({
				bindTarget: V_BindTargetDeclaration,
			}),
			{
				bindTarget: bindTarget,
			},
		);

		return this.mb.metadataManager.read(bindTarget);
	}

	/**
	 * Updates a property in meta binds metadata cache.
	 *
	 * @example
	 * // Assumes you use the JS Engine plugin to run this.
	 * const mb = engine.getPlugin("obsidian-meta-bind-plugin").api;
	 * const bindTarget = mb.parseBindTarget("property", context.file.path);
	 * mb.updateMetadata(bindTarget, (value) => {
	 *     return value + 1;
	 * });
	 *
	 * @param bindTarget
	 * @param updateFn a function that takes the current value and returns the new value
	 */
	public updateMetadata(bindTarget: BindTargetDeclaration, updateFn: (value: unknown) => unknown): void {
		validateAPIArgs(
			z.object({
				bindTarget: V_BindTargetDeclaration,
				updateFn: zodFunction<(value: unknown) => unknown>(),
			}),
			{
				bindTarget: bindTarget,
				updateFn: updateFn,
			},
		);

		const value = this.mb.metadataManager.read(bindTarget);
		const newValue = updateFn(value);
		this.mb.metadataManager.write(newValue, bindTarget);
	}

	/**
	 * Subscribes to a property in meta binds metadata cache.
	 * This expects some sort of lifecycle hook to be passed in.
	 * This method will register a callback to the lifecycle hook.
	 * To unsubscribe the subscription, the callback registered to the lifecycle hook must be called.
	 * In the context of Obsidian, you should pass a `Component` instance as the lifecycle hook and
	 * make sure to unload the component when you are done using the metadata subscription.
	 *
	 * NOT UNSUBSCRIBING WILL LEAD TO MEMORY LEAKS.
	 *
	 * @param bindTarget
	 * @param lifecycleHook In Obsidian this is an instance of the Component class. The subscription will be automatically unsubscribed when the component is unloaded.
	 * @param callback
	 */
	public subscribeToMetadata(
		bindTarget: BindTargetDeclaration,
		lifecycleHook: LifecycleHook,
		callback: (value: unknown) => void,
	): void {
		validateAPIArgs(
			z.object({
				bindTarget: V_BindTargetDeclaration,
				lifecycleHook: this.mb.internal.getLifecycleHookValidator(),
				callback: zodFunction<(value: unknown) => void>(),
			}),
			{
				bindTarget: bindTarget,
				lifecycleHook: lifecycleHook,
				callback: callback,
			},
		);

		const uuid = getUUID();
		const signal = new Signal<unknown>(undefined);

		signal.registerListener({
			callback: callback,
		});

		const subscription = this.mb.metadataManager.subscribe(uuid, signal, bindTarget, (): void => {
			signal.unregisterAllListeners();
		});

		lifecycleHook.register(() => {
			subscription.unsubscribe();
		});
	}

	/**
	 * Creates a note position from a line start and line end number.
	 *
	 * @param lineStart
	 * @param lineEnd
	 */
	public createNotePosition(lineStart: number, lineEnd: number): NotePosition {
		validateAPIArgs(
			z.object({
				lineStart: z.number(),
				lineEnd: z.number(),
			}),
			{
				lineStart: lineStart,
				lineEnd: lineEnd,
			},
		);

		return new NotePosition({
			lineStart: lineStart,
			lineEnd: lineEnd,
		});
	}

	/**
	 * Import new definitions into the internal mathJS instance.
	 * For details on how to use, see https://mathjs.org/docs/reference/functions/import.html
	 */
	public mathJSImport(object: MathJSImportObject | MathJSImportObject[], options?: MathJSImportOptions): void {
		this.mb.math.import(object, options);
	}
}
