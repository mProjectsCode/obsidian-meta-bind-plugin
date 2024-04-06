import { schemaForType } from 'packages/core/src/utils/ZodUtils';
import {
	type ButtonGroupOptions,
	type ButtonOptions,
	type EmbedOptions,
	FieldType,
	type InputFieldOptions,
	InputFieldType,
	type JsViewFieldOptions,
	NotePosition,
	RenderChildType,
	type TableFieldOptions,
	type ViewFieldOptions,
} from 'packages/core/src/config/FieldConfigs';
import { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import type {
	SimpleInputFieldDeclaration,
	UnvalidatedInputFieldDeclaration,
} from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import {
	type BindTargetDeclaration,
	type SimplePropAccess,
	type UnvalidatedBindTargetDeclaration,
	type UnvalidatedPropAccess,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { PropAccessType } from 'packages/core/src/utils/prop/PropAccess';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import {
	type SimpleJsViewFieldBindTargetMapping,
	type SimpleJsViewFieldDeclaration,
	type SimpleViewFieldDeclaration,
	type UnvalidatedViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { PropPath } from 'packages/core/src/utils/prop/PropPath';
import { Signal } from 'packages/core/src/utils/Signal';
import { z } from 'zod';
import { type ParsingPosition, type ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';
import { type SimpleButtonGroupDeclaration } from 'packages/core/src/parsers/ButtonParser';
import { V_ButtonConfig } from 'packages/core/src/config/ButtonConfigValidators';
import {
	type SimpleFieldArgument,
	type UnvalidatedFieldArgument,
} from 'packages/core/src/parsers/nomParsers/FieldArgumentNomParsers';
import { FieldMountable } from 'packages/core/src/fields/FieldMountable';

export const V_FilePath = schemaForType<string>()(z.string());

export const V_RenderChildType = schemaForType<RenderChildType>()(z.nativeEnum(RenderChildType));

export const V_FieldType = schemaForType<FieldType>()(z.nativeEnum(FieldType));

export const V_InputFieldType = schemaForType<InputFieldType>()(z.nativeEnum(InputFieldType));

export const V_HTMLElement = schemaForType<HTMLElement>()(z.instanceof(HTMLElement));

export const V_BindTargetScope = schemaForType<BindTargetScope>()(z.instanceof(BindTargetScope));

export const V_Signal = schemaForType<Signal<unknown>>()(z.instanceof(Signal));

export const V_VoidFunction = schemaForType<() => void>()(z.function().args().returns(z.void()));

export const V_FieldMountable = schemaForType<FieldMountable>()(z.instanceof(FieldMountable));

export const V_NotePosition = schemaForType<NotePosition>()(z.instanceof(NotePosition));

export const V_ParsingPosition = schemaForType<ParsingPosition>()(
	z.object({
		index: z.number(),
		line: z.number(),
		column: z.number(),
	}),
);

export const V_ParsingRange = schemaForType<ParsingRange>()(
	z.object({
		from: V_ParsingPosition,
		to: V_ParsingPosition,
	}),
);

export const V_ParsingResultNode = schemaForType<ParsingResultNode>()(
	z.object({
		value: z.string(),
		position: V_ParsingRange.optional(),
	}),
);

export const V_UnvalidatedFieldArgument = schemaForType<UnvalidatedFieldArgument>()(
	z.object({
		name: V_ParsingResultNode,
		value: V_ParsingResultNode.array(),
	}),
);

export const V_UnvalidatedPropAccess = schemaForType<UnvalidatedPropAccess>()(
	z.object({
		type: z.nativeEnum(PropAccessType),
		prop: V_ParsingResultNode,
	}),
);

export const V_UnvalidatedBindTargetDeclaration = schemaForType<UnvalidatedBindTargetDeclaration>()(
	z.object({
		storageType: V_ParsingResultNode.optional(),
		storagePath: V_ParsingResultNode.optional(),
		storageProp: V_UnvalidatedPropAccess.array(),
		listenToChildren: z.boolean(),
	}),
);

export const V_UnvalidatedInputFieldDeclaration = schemaForType<UnvalidatedInputFieldDeclaration>()(
	z.object({
		declarationString: z.string().optional(),
		inputFieldType: V_ParsingResultNode.optional(),
		templateName: V_ParsingResultNode.optional(),
		bindTarget: V_UnvalidatedBindTargetDeclaration.optional(),
		arguments: V_UnvalidatedFieldArgument.array(),
		errorCollection: z.instanceof(ErrorCollection),
	}),
);

export const V_UnvalidatedViewFieldDeclaration = schemaForType<UnvalidatedViewFieldDeclaration>()(
	z.object({
		declarationString: z.string().optional(),
		templateDeclaration: z.array(z.union([z.string(), V_UnvalidatedBindTargetDeclaration])).optional(),
		viewFieldType: V_ParsingResultNode.optional(),
		arguments: V_UnvalidatedFieldArgument.array(),
		writeToBindTarget: V_UnvalidatedBindTargetDeclaration.optional(),
		errorCollection: z.instanceof(ErrorCollection),
	}),
);

export const V_BindTargetDeclaration = schemaForType<BindTargetDeclaration>()(
	z.object({
		storageType: z.string(),
		storagePath: z.string(),
		storageProp: z.instanceof(PropPath),
		listenToChildren: z.boolean(),
	}),
);

export const V_SimpleFieldArgument = schemaForType<SimpleFieldArgument>()(
	z.object({
		name: z.string(),
		value: z.string().array(),
	}),
);

export const V_SimplePropAccess = schemaForType<SimplePropAccess>()(
	z.object({
		type: z.nativeEnum(PropAccessType),
		prop: z.string(),
	}),
);

export const V_SimpleInputFieldDeclaration = schemaForType<SimpleInputFieldDeclaration>()(
	z.object({
		inputFieldType: V_InputFieldType.optional(),
		templateName: z.string().optional(),
		bindTarget: V_BindTargetDeclaration.optional(),
		arguments: V_SimpleFieldArgument.array().optional(),
	}),
);

export const V_SimpleViewFieldDeclaration = schemaForType<SimpleViewFieldDeclaration>()(
	z.object({
		viewFieldType: V_InputFieldType.optional(),
		templateDeclaration: z.union([z.string(), V_BindTargetDeclaration]).array().optional(),
		arguments: V_SimpleFieldArgument.array().optional(),
		writeToBindTarget: V_BindTargetDeclaration.optional(),
	}),
);

export const V_SimpleJsViewFieldBindTargetMapping = schemaForType<SimpleJsViewFieldBindTargetMapping>()(
	z.object({
		bindTarget: V_BindTargetDeclaration,
		name: z.string(),
	}),
);

export const V_SimpleJsViewFieldDeclaration = schemaForType<SimpleJsViewFieldDeclaration>()(
	z.object({
		bindTargetMappings: V_SimpleJsViewFieldBindTargetMapping.array(),
		writeToBindTarget: V_BindTargetDeclaration.optional(),
		code: z.string(),
	}),
);

export const V_SimpleInlineButtonDeclaration = schemaForType<SimpleButtonGroupDeclaration>()(
	z.object({
		referencedButtonIds: z.string().array(),
	}),
);

export const V_InputFieldOptions = schemaForType<InputFieldOptions>()(
	z.object({
		renderChildType: V_RenderChildType,
		declaration: z.union([z.string(), V_SimpleInputFieldDeclaration]),
		scope: V_BindTargetScope.optional(),
	}),
);

export const V_ViewFieldOptions = schemaForType<ViewFieldOptions>()(
	z.object({
		renderChildType: V_RenderChildType,
		declaration: z.union([z.string(), V_SimpleViewFieldDeclaration]),
		scope: V_BindTargetScope.optional(),
	}),
);

export const V_JsViewFieldOptions = schemaForType<JsViewFieldOptions>()(
	z.object({
		declaration: z.union([z.string(), V_SimpleJsViewFieldDeclaration]),
	}),
);

export const V_TableFieldOptions = schemaForType<TableFieldOptions>()(
	z.object({
		bindTarget: V_BindTargetDeclaration,
		tableHead: z.string().array(),
		columns: z.array(z.union([V_UnvalidatedInputFieldDeclaration, V_UnvalidatedViewFieldDeclaration])),
	}),
);

export const V_InlineButtonOptions = schemaForType<ButtonGroupOptions>()(
	z.object({
		renderChildType: V_RenderChildType,
		declaration: z.union([z.string(), V_SimpleInlineButtonDeclaration]),
		position: V_NotePosition.optional(),
	}),
);

export const V_ButtonOptions = schemaForType<ButtonOptions>()(
	z.object({
		declaration: z.union([z.string(), V_ButtonConfig]),
		position: V_NotePosition.optional(),
		isPreview: z.boolean(),
	}),
);

export const V_EmbedOptions = schemaForType<EmbedOptions>()(
	z.object({
		depth: z.number(),
		content: z.string(),
	}),
);
