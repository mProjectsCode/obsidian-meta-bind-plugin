import { type ViewFieldVariable } from '../../renderChildren/ViewFieldMDRC';

import { ViewFieldArgumentType } from '../../config/FieldConfigs';
import { stringifyUnknown } from '../../utils/Literal';
import { type IViewFieldBase } from './IViewFieldBase';
import {
	type ComputedMetadataSubscription,
	type ComputedSubscriptionDependency,
} from '../../metadata/ComputedMetadataSubscription';
import { Signal } from '../../utils/Signal';

export abstract class AbstractViewField {
	readonly base: IViewFieldBase;
	readonly inputSignal: Signal<unknown>;

	private metadataSubscription?: ComputedMetadataSubscription;

	variables: ViewFieldVariable[];

	container?: HTMLElement;
	// hidden argument

	hidden: boolean;

	protected constructor(base: IViewFieldBase) {
		this.base = base;
		this.inputSignal = new Signal<unknown>(undefined);

		this.variables = [];

		this.hidden = false;
	}

	protected abstract buildVariables(): void;

	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	protected abstract computeValue(): unknown | Promise<unknown>;

	private async initialRender(container: HTMLElement): Promise<void> {
		this.container = container;
		this.container.addClass('mb-view-text');

		this.hidden = this.base.getArgument(ViewFieldArgumentType.HIDDEN)?.value ?? false;

		if (this.hidden) {
			this.container.addClass('mb-view-hidden');
		}

		await this.onInitialRender(container);

		await this.rerender('');
	}

	protected abstract onInitialRender(container: HTMLElement): void | Promise<void>;

	private async rerender(value: unknown): Promise<void> {
		if (!this.container) {
			return;
		}

		if (!this.hidden) {
			const text = stringifyUnknown(value, this.base.plugin.settings.viewFieldDisplayNullAsEmpty) ?? '';
			this.container.empty();
			await this.onRerender(this.container, text);
		}
	}

	protected abstract onRerender(container: HTMLElement, text: string): void | Promise<void>;

	public destroy(): void {
		this.unmount();
	}

	public mount(container: HTMLElement): void {
		this.onmount();

		this.buildVariables();

		this.inputSignal.registerListener({ callback: value => void this.rerender(value) });

		this.metadataSubscription = this.base.plugin.metadataManager.subscribeComputed(
			this.base.getUuid(),
			this.inputSignal,
			this.base.getDeclaration().writeToBindTarget,
			this.variables.map((x): ComputedSubscriptionDependency => {
				return {
					bindTarget: x.bindTargetDeclaration,
					callbackSignal: x.inputSignal,
				};
			}),
			async () => await this.computeValue(),
			() => this.base.unload(),
		);

		void this.initialRender(container);
	}

	public unmount(): void {
		this.onunmount();

		this.inputSignal.unregisterAllListeners();
		this.metadataSubscription?.unsubscribe();
	}

	protected onmount(): void {}

	protected onunmount(): void {}
}
