import { z } from 'zod';
import { type ParsingPosition, type ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';
import { Component } from 'obsidian';
import { schemaForType } from 'packages/core/src/utils/ZodUtils';
import { RenderChildType } from 'packages/core/src/config/FieldConfigs';
import { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import {
	type UnvalidatedFieldArgument,
	type UnvalidatedInputFieldDeclaration,
} from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import {
	type BindTargetDeclaration,
	BindTargetStorageType,
	type UnvalidatedBindTargetDeclaration,
	type UnvalidatedPropAccess,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { PROP_ACCESS_TYPE } from 'packages/core/src/utils/prop/PropAccess';
import { type UnvalidatedViewFieldDeclaration } from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { PropPath } from 'packages/core/src/utils/prop/PropPath';
import { Signal } from 'packages/core/src/utils/Signal';
import { type ComponentLike, type ObsidianAPI } from 'packages/obsidian/src/ObsidianAPI';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';

export const V_FilePath = schemaForType<string>()(z.string());

export const V_RenderChildType = schemaForType<RenderChildType>()(z.nativeEnum(RenderChildType));

export const V_HTMLElement = schemaForType<HTMLElement>()(z.instanceof(HTMLElement));
export const V_Component = schemaForType<Component>()(z.instanceof(Component));
export const V_BindTargetScope = schemaForType<BindTargetScope>()(z.instanceof(BindTargetScope));

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
		type: z.nativeEnum(PROP_ACCESS_TYPE),
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
		fullDeclaration: z.string(),
		inputFieldType: V_ParsingResultNode.optional(),
		templateName: V_ParsingResultNode.optional(),
		bindTarget: V_UnvalidatedBindTargetDeclaration.optional(),
		arguments: V_UnvalidatedFieldArgument.array(),
		errorCollection: z.instanceof(ErrorCollection),
	}),
);

export const V_UnvalidatedViewFieldDeclaration = schemaForType<UnvalidatedViewFieldDeclaration>()(
	z.object({
		fullDeclaration: z.string(),
		templateDeclaration: z.array(z.union([z.string(), V_UnvalidatedBindTargetDeclaration])),
		viewFieldType: V_ParsingResultNode.optional(),
		arguments: V_UnvalidatedFieldArgument.array(),
		writeToBindTarget: V_UnvalidatedBindTargetDeclaration.optional(),
		errorCollection: z.instanceof(ErrorCollection),
	}),
);

export const V_BindTargetDeclaration = schemaForType<BindTargetDeclaration>()(
	z.object({
		storageType: z.nativeEnum(BindTargetStorageType),
		storagePath: z.string(),
		storageProp: z.instanceof(PropPath),
		listenToChildren: z.boolean(),
	}),
);

export const V_Signal = schemaForType<Signal<unknown>>()(z.instanceof(Signal));
export const V_VoidFunction = schemaForType<() => void>()(z.function().args().returns(z.void()));

export const V_ComponentLike = schemaForType<ComponentLike>()(
	z.object({
		addChild: z.function().args(z.instanceof(Component)).returns(z.void()),
	}),
);

export const V_API_createInputField = schemaForType<Parameters<InstanceType<typeof ObsidianAPI>['createInputField']>>()(
	z.tuple([
		V_UnvalidatedInputFieldDeclaration,
		V_RenderChildType,
		V_FilePath,
		V_HTMLElement,
		V_ComponentLike,
		V_BindTargetScope.optional(),
	]),
);

export const V_API_createInputFieldFromString = schemaForType<
	Parameters<InstanceType<typeof ObsidianAPI>['createInputFieldFromString']>
>()(z.tuple([z.string(), V_RenderChildType, V_FilePath, V_HTMLElement, V_ComponentLike, V_BindTargetScope.optional()]));

export const V_API_createViewFieldFromString = schemaForType<
	Parameters<InstanceType<typeof ObsidianAPI>['createViewFieldFromString']>
>()(z.tuple([z.string(), V_RenderChildType, V_FilePath, V_HTMLElement, V_ComponentLike, V_BindTargetScope.optional()]));

export const V_API_createJsViewFieldFromString = schemaForType<
	Parameters<InstanceType<typeof ObsidianAPI>['createJsViewFieldFromString']>
>()(z.tuple([z.string(), V_RenderChildType, V_FilePath, V_HTMLElement, V_ComponentLike]));

export const V_API_createExcludedField = schemaForType<
	Parameters<InstanceType<typeof ObsidianAPI>['createExcludedField']>
>()(z.tuple([V_HTMLElement, V_FilePath, V_ComponentLike]));

export const V_API_listenToMetadata = schemaForType<Parameters<InstanceType<typeof ObsidianAPI>['listenToMetadata']>>()(
	z.tuple([V_Signal, V_FilePath, z.array(z.string()), z.boolean(), V_VoidFunction.optional()]),
);

export const V_API_createTable = schemaForType<Parameters<InstanceType<typeof ObsidianAPI>['createTable']>>()(
	z.tuple([
		V_HTMLElement,
		V_FilePath,
		V_ComponentLike,
		V_BindTargetDeclaration,
		z.array(z.string()),
		z.array(z.union([V_UnvalidatedInputFieldDeclaration, V_UnvalidatedViewFieldDeclaration])),
	]),
);

export const V_API_createBindTarget = schemaForType<Parameters<InstanceType<typeof ObsidianAPI>['createBindTarget']>>()(
	z.tuple([z.string(), V_FilePath]),
);

export const V_API_createButtonFromString = schemaForType<
	Parameters<InstanceType<typeof ObsidianAPI>['createButtonFromString']>
>()(z.tuple([z.string(), V_FilePath, V_HTMLElement, V_ComponentLike]));

export const V_API_createInlineButtonFromString = schemaForType<
	Parameters<InstanceType<typeof ObsidianAPI>['createInlineButtonFromString']>
>()(z.tuple([z.string(), V_FilePath, V_HTMLElement, V_ComponentLike]));
