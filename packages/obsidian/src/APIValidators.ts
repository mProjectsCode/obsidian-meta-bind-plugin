import { Component } from 'obsidian';
import { schemaForType } from 'packages/core/src/utils/ZodUtils';
import { type ComponentLike, type ObsidianAPI } from 'packages/obsidian/src/ObsidianAPI';
import { z } from 'zod';
import {
	V_BindTargetDeclaration,
	V_FilePath,
	V_HTMLElement,
	V_UnvalidatedInputFieldDeclaration,
	V_UnvalidatedViewFieldDeclaration,
} from 'packages/core/src/api/Validators';

export const V_Component = schemaForType<Component>()(z.instanceof(Component));

export const V_ComponentLike = schemaForType<ComponentLike>()(
	z.object({
		addChild: z.function().args(z.instanceof(Component)).returns(z.void()),
	}),
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
