import { Component, type MarkdownPostProcessorContext } from 'obsidian';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import { API, type LifecycleHook } from 'packages/core/src/api/API.js';
import { type BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { getUUID } from 'packages/core/src/utils/Utils';
import { validate } from 'packages/core/src/utils/ZodUtils';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { MarkdownRenderChildWidget } from 'packages/obsidian/src/cm6/Cm6_Widgets';
import { MountableMDRC } from 'packages/obsidian/src/MountableMDRC';
import { type FieldType, isFieldTypeAllowedInline } from 'packages/core/src/config/FieldConfigs';
import { z } from 'zod';
import { V_BindTargetDeclaration, V_HTMLElement, V_Mountable } from 'packages/core/src/api/Validators';
import { Signal } from 'packages/core/src/utils/Signal';
import { getJsEnginePluginAPI } from 'packages/obsidian/src/ObsUtils';
import { type ReactiveComponent } from 'jsEngine/api/reactive/ReactiveComponent';
import { type Mountable } from 'packages/core/src/utils/Mountable';

/**
 * Either {@link MarkdownPostProcessorContext} or {@link Component}.
 */
export interface ComponentLike {
	addChild(child: Component): void;
}

/**
 * @internal
 */
export const V_ComponentLike = z.object({
	addChild: z.function().args(z.instanceof(Component)).returns(z.void()),
});

/**
 * Meta Bind API for Obsidian.
 * @extends API
 */
export class ObsidianAPI extends API<MetaBindPlugin> {
	constructor(plugin: MetaBindPlugin) {
		super(plugin);
	}

	public wrapInMDRC(field: Mountable, containerEl: HTMLElement, component: ComponentLike): MountableMDRC {
		validate(
			z.object({
				field: V_Mountable,
				containerEl: V_HTMLElement,
				component: V_ComponentLike,
			}),
			{
				field: field,
				containerEl: containerEl,
				component: component,
			},
		);

		const mdrc = new MountableMDRC(this.plugin, field, containerEl);
		component.addChild(mdrc);

		return mdrc;
	}

	/**
	 * Creates a MDRC widget from a given widget type.
	 *
	 * @param mdrcType
	 * @param content
	 * @param filePath
	 * @param component
	 */
	public constructMDRCWidget(
		mdrcType: FieldType,
		content: string,
		filePath: string,
		component: Component,
	): MarkdownRenderChildWidget {
		if (isFieldTypeAllowedInline(mdrcType)) {
			return new MarkdownRenderChildWidget(mdrcType, content, filePath, component, this.plugin);
		}

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to construct mdrc',
			cause: `Invalid inline mdrc type "${mdrcType}"`,
		});
	}

	/**
	 * Creates a JS Engine reactive component that will re-render when the given bind targets change.
	 *
	 * This requires JS Engine to be installed and enabled!
	 *
	 * @param bindTargets
	 * @param lifecycleHook
	 * @param callback
	 */
	public reactiveMetadata(
		bindTargets: BindTargetDeclaration[],
		lifecycleHook: LifecycleHook,
		callback: (...values: unknown[]) => Promise<unknown>,
	): ReactiveComponent {
		validate(
			z.object({
				bindTargets: V_BindTargetDeclaration.array(),
				lifecycleHook: this.plugin.internal.getLifecycleHookValidator(),
				callback: z.function(),
			}),
			{
				bindTargets: bindTargets,
				lifecycleHook: lifecycleHook,
				callback: callback,
			},
		);

		const jsEngine = getJsEnginePluginAPI(this.plugin);

		const uuid = getUUID();
		const signal = new Signal<unknown>(undefined);

		const dependencies = bindTargets.map(bindTarget => ({
			bindTarget: bindTarget,
			callbackSignal: new Signal<unknown>(undefined),
		}));

		let reactive: ReactiveComponent | undefined = undefined;

		const subscription = this.plugin.metadataManager.subscribeComputed(
			uuid,
			signal,
			undefined,
			dependencies,
			(values: unknown[]) => reactive?.refresh(...values),
			() => {},
		);

		lifecycleHook.register(() => subscription.unsubscribe());

		reactive = jsEngine.reactive(callback, ...dependencies.map(x => x.callbackSignal.get()));

		return reactive;
	}
}
