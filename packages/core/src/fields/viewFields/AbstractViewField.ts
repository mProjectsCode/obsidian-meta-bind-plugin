import { ViewFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import type { ViewFieldMountable } from 'packages/core/src/fields/viewFields/ViewFieldMountable';
import type { ViewFieldVariable } from 'packages/core/src/fields/viewFields/ViewFieldVariable';
import type { IPlugin } from 'packages/core/src/IPlugin';
import type {
	ComputedMetadataSubscription,
	ComputedSubscriptionDependency,
} from 'packages/core/src/metadata/ComputedMetadataSubscription';
import { stringifyUnknown } from 'packages/core/src/utils/Literal';
import { Mountable } from 'packages/core/src/utils/Mountable';
import { Signal } from 'packages/core/src/utils/Signal';
import { DomHelpers } from 'packages/core/src/utils/Utils';

export abstract class AbstractViewField extends Mountable {
	readonly plugin: IPlugin;
	readonly mountable: ViewFieldMountable;
	readonly inputSignal: Signal<unknown>;

	private metadataSubscription?: ComputedMetadataSubscription;

	variables: ViewFieldVariable[];

	// hidden argument
	hidden: boolean;

	protected constructor(mountable: ViewFieldMountable) {
		super();

		this.mountable = mountable;
		this.plugin = mountable.plugin;
		this.inputSignal = new Signal<unknown>(undefined);

		this.variables = [];

		this.hidden = false;
	}

	protected abstract buildVariables(): void;

	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	protected abstract computeValue(): unknown | Promise<unknown>;

	private async initialRender(targetEl: HTMLElement): Promise<void> {
		DomHelpers.addClass(targetEl, 'mb-view-text');

		this.hidden = this.mountable.getArgument(ViewFieldArgumentType.HIDDEN)?.value ?? false;

		if (this.hidden) {
			DomHelpers.addClass(targetEl, 'mb-view-hidden');
		}

		await this.onInitialRender(targetEl);

		await this.rerender(targetEl, '');
	}

	protected abstract onInitialRender(container: HTMLElement): void | Promise<void>;

	private async rerender(targetEl: HTMLElement, value: unknown): Promise<void> {
		if (!this.hidden) {
			const text = stringifyUnknown(value, this.mountable.plugin.settings.viewFieldDisplayNullAsEmpty) ?? '';
			DomHelpers.empty(targetEl);
			await this.onRerender(targetEl, text);
		}
	}

	protected abstract onRerender(targetEl: HTMLElement, text: string): void | Promise<void>;

	protected onMount(targetEl: HTMLElement): void {
		this.buildVariables();

		this.inputSignal.registerListener({ callback: value => void this.rerender(targetEl, value) });

		this.metadataSubscription = this.mountable.plugin.metadataManager.subscribeComputed(
			this.mountable.getUuid(),
			this.inputSignal,
			this.mountable.getDeclaration().writeToBindTarget,
			this.variables.map((x): ComputedSubscriptionDependency => {
				return {
					bindTarget: x.bindTargetDeclaration,
					callbackSignal: x.inputSignal,
				};
			}),
			async () => await this.computeValue(),
			() => this.mountable.unmount(),
		);

		void this.initialRender(targetEl);
	}

	protected onUnmount(): void {
		this.inputSignal.unregisterAllListeners();
		this.metadataSubscription?.unsubscribe();
	}
}
