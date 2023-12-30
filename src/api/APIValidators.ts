import { z } from 'zod';
import { oneOf, schemaForType } from '../utils/ZodUtils';
import { API, ComponentLike } from './API';
import { RenderChildType } from '../config/FieldConfigs';
import {
	UnvalidatedFieldArgument,
	UnvalidatedInputFieldDeclaration,
} from '../parsers/inputFieldParser/InputFieldDeclaration';
import { ParsingResultNode } from '../parsers/nomParsers/GeneralNomParsers';
import { ParsingPosition, ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';
import {
	BindTargetDeclaration,
	BindTargetStorageType,
	UnvalidatedBindTargetDeclaration,
	UnvalidatedPropAccess,
} from '../parsers/bindTargetParser/BindTargetDeclaration';
import { PROP_ACCESS_TYPE } from '../utils/prop/PropAccess';
import { ErrorCollection } from '../utils/errors/ErrorCollection';
import { Component } from 'obsidian';
import { BindTargetScope } from '../metadata/BindTargetScope';
import { Signal } from '../utils/Signal';
import { UnvalidatedViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { PropPath } from '../utils/prop/PropPath';

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
