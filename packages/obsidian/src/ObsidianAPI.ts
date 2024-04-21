import { Component } from 'obsidian';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import { API, type LifecycleHook } from 'packages/core/src/api/API.js';
import { type BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { getUUID } from 'packages/core/src/utils/Utils';
import { validate } from 'packages/core/src/utils/ZodUtils';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { MarkdownRenderChildWidget } from 'packages/obsidian/src/cm6/Cm6_Widgets';
import { MountableMDRC } from 'packages/obsidian/src/MountableMDRC';
import { z } from 'zod';
import { V_BindTargetDeclaration, V_HTMLElement, V_Mountable } from 'packages/core/src/api/Validators';
import { Signal } from 'packages/core/src/utils/Signal';
import { getJsEnginePluginAPI } from 'packages/obsidian/src/ObsUtils';
import { type ReactiveComponent } from 'jsEngine/api/reactive/ReactiveComponent';
import { type Mountable } from 'packages/core/src/utils/Mountable';
import { type InlineFieldType, isFieldTypeAllowedInline } from 'packages/core/src/config/APIConfigs';

/**
 * Either a [Component](https://docs.obsidian.md/Reference/TypeScript+API/Component) or a [MarkdownPostProcessorContext](https://docs.obsidian.md/Reference/TypeScript+API/MarkdownPostProcessorContext).
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

	/**
	 * Wraps any mountable in a [MarkdownRenderChild](https://docs.obsidian.md/Reference/TypeScript+API/MarkdownRenderChild)
	 * and adds it as a child to the passed in {@link ComponentLike}.
	 *
	 * A {@link ComponentLike} is either a [Component](https://docs.obsidian.md/Reference/TypeScript+API/Component) or a [MarkdownPostProcessorContext](https://docs.obsidian.md/Reference/TypeScript+API/MarkdownPostProcessorContext)
	 *
	 * @param mountable the mountable to wrap in a [MarkdownRenderChild](https://docs.obsidian.md/Reference/TypeScript+API/MarkdownRenderChild)
	 * @param containerEl the element to mount the [MarkdownRenderChild](https://docs.obsidian.md/Reference/TypeScript+API/MarkdownRenderChild) to
	 * @param component the {@link ComponentLike} to register the [MarkdownRenderChild](https://docs.obsidian.md/Reference/TypeScript+API/MarkdownRenderChild) to
	 */
	public wrapInMDRC(mountable: Mountable, containerEl: HTMLElement, component: ComponentLike): MountableMDRC {
		validate(
			z.object({
				field: V_Mountable,
				containerEl: V_HTMLElement,
				component: V_ComponentLike,
			}),
			{
				field: mountable,
				containerEl: containerEl,
				component: component,
			},
		);

		const mdrc = new MountableMDRC(this.plugin, mountable, containerEl);
		component.addChild(mdrc);

		return mdrc;
	}

	/**
	 * Creates a CM6 widget from a given widget type.
	 *
	 * This is only useful fur use in a CodeMirror plugin.
	 *
	 * @param inlineFieldType
	 * @param content
	 * @param filePath
	 * @param component
	 */
	public constructMDRCWidget(
		inlineFieldType: InlineFieldType,
		content: string,
		filePath: string,
		component: Component,
	): MarkdownRenderChildWidget {
		if (isFieldTypeAllowedInline(inlineFieldType)) {
			return new MarkdownRenderChildWidget(inlineFieldType, content, filePath, component, this.plugin);
		}

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to construct mdrc',
			cause: `Invalid inline field type "${inlineFieldType}"`,
		});
	}

	/**
	 * Creates a JS Engine reactive component that will re-render when the given bind targets change.
	 *
	 * This requires JS Engine to be installed and enabled!
	 *
	 * @param bindTargets the bind targets to listen to
	 * @param lifecycleHook a [Component](https://docs.obsidian.md/Reference/TypeScript+API/Component)
	 * @param callback the callback to call with all the values of the bind targets when one of them changes. What ever this callback returns will be rendered by the reactive component.
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
