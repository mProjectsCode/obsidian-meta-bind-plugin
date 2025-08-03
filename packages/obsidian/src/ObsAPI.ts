import type { ReactiveComponent } from 'jsEngine/api/reactive/ReactiveComponent';
import type { Component } from 'obsidian';
import type { LifecycleHook } from 'packages/core/src/api/API.js';
import { API } from 'packages/core/src/api/API.js';
import type { InlineFieldType } from 'packages/core/src/config/APIConfigs';
import { isFieldTypeAllowedInline } from 'packages/core/src/config/APIConfigs';
import { V_BindTargetDeclaration, V_HTMLElement, V_Mountable } from 'packages/core/src/config/validators/Validators';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { Mountable } from 'packages/core/src/utils/Mountable';
import { Signal } from 'packages/core/src/utils/Signal';
import { getUUID } from 'packages/core/src/utils/Utils';
import { validateAPIArgs, zodFunction } from 'packages/core/src/utils/ZodUtils';
import { MarkdownRenderChildWidget } from 'packages/obsidian/src/cm6/Cm6_Widgets';
import type { ObsComponents, ObsMetaBind } from 'packages/obsidian/src/main';
import { MountableMDRC } from 'packages/obsidian/src/MountableMDRC';
import { getJsEnginePluginAPI } from 'packages/obsidian/src/ObsUtils';
import { z } from 'zod';

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
	addChild: zodFunction<(child: Component) => void>(),
});

/**
 * Meta Bind API for Obsidian.
 * @extends API
 */
export class ObsAPI extends API<ObsComponents> {
	// This is needed to access the plugin instance with the correct type.
	private readonly omb: ObsMetaBind;

	constructor(mb: ObsMetaBind) {
		super(mb);

		this.omb = mb;
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
		validateAPIArgs(
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

		const mdrc = new MountableMDRC(this.omb, mountable, containerEl);
		component.addChild(mdrc);

		return mdrc;
	}

	/**
	 * Creates a CM6 widget from a given widget type.
	 *
	 * This is only useful for use in a CodeMirror plugin.
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
			return new MarkdownRenderChildWidget(inlineFieldType, content, filePath, component, this.omb);
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
		validateAPIArgs(
			z.object({
				bindTargets: V_BindTargetDeclaration.array(),
				lifecycleHook: this.mb.internal.getLifecycleHookValidator(),
				callback: zodFunction<(...values: unknown[]) => Promise<unknown>>(),
			}),
			{
				bindTargets: bindTargets,
				lifecycleHook: lifecycleHook,
				callback: callback,
			},
		);

		const jsEngine = getJsEnginePluginAPI(this.omb);
		const uuid = getUUID();
		const metadataSignals = bindTargets.map(() => new Signal<unknown>(undefined));

		// we start with a noop callback so that we can create the subscription
		let cb = (): Promise<void> => Promise.resolve();

		const subscription = this.mb.metadataManager.subscribeEffect(
			uuid,
			bindTargets,
			metadataSignals,
			() => cb(),
			() => {},
		);
		lifecycleHook.register(() => subscription.unsubscribe());

		// we create the reactive component here so that the metadata signals are already set up
		const reactive = jsEngine.reactive(callback, ...metadataSignals.map(x => x.get()));

		// now we update the callback to actually refresh the reactive component
		cb = (): Promise<void> => reactive.refresh(...metadataSignals.map(x => x.get()));

		return reactive;
	}
}
