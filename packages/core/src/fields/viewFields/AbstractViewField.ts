import type { MetaBind } from 'packages/core/src';
import { ViewFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import type { ViewFieldMountable } from 'packages/core/src/fields/viewFields/ViewFieldMountable';
import type { ViewFieldVariable } from 'packages/core/src/fields/viewFields/ViewFieldVariable';
import type { DerivedMetadataSubscription } from 'packages/core/src/metadata/DerivedMetadataSubscription';
import { Mountable } from 'packages/core/src/utils/Mountable';
import { DomHelpers } from 'packages/core/src/utils/Utils';

export abstract class AbstractViewField<T> extends Mountable {
	readonly mb: MetaBind;
	readonly mountable: ViewFieldMountable;

	private metadataSubscription?: DerivedMetadataSubscription;

	variables: ViewFieldVariable[];

	// hidden argument
	hidden: boolean;

	protected constructor(mountable: ViewFieldMountable) {
		super();

		this.mountable = mountable;
		this.mb = mountable.mb;

		this.variables = [];

		this.hidden = false;
	}

	protected abstract buildVariables(): void;

	protected abstract computeValue(): T | Promise<T>;

	protected abstract mapValue(value: T): unknown;

	private async initialRender(targetEl: HTMLElement): Promise<void> {
		DomHelpers.addClass(targetEl, 'mb-view-text');

		this.hidden = this.mountable.getArgument(ViewFieldArgumentType.HIDDEN)?.value ?? false;

		if (this.hidden) {
			DomHelpers.addClass(targetEl, 'mb-view-hidden');
		}

		await this.onInitialRender(targetEl);
	}

	protected abstract onInitialRender(container: HTMLElement): void | Promise<void>;

	private async rerender(targetEl: HTMLElement, value: T | undefined): Promise<void> {
		if (!this.hidden) {
			await this.onRerender(targetEl, value);
		}
	}

	protected abstract onRerender(targetEl: HTMLElement, value: T | undefined): void | Promise<void>;

	protected onMount(targetEl: HTMLElement): void {
		this.buildVariables();

		void this.initialRender(targetEl);

		this.metadataSubscription = this.mountable.mb.metadataManager.subscribeDerived(
			this.mountable.getUuid(),
			this.mountable.getDeclaration().writeToBindTarget,
			this.variables.map(x => x.bindTargetDeclaration),
			this.variables.map(x => x.metadataSignal),
			async () => {
				const value = await this.computeValue();
				void this.rerender(targetEl, value);
				return this.mapValue(value);
			},
			() => this.mountable.unmount(),
		);
	}

	protected onUnmount(): void {
		this.metadataSubscription?.unsubscribe();
	}
}
