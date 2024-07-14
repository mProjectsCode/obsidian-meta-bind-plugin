import { FieldMountable } from 'packages/core/src/fields/FieldMountable';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';

export class ExcludedMountable extends FieldMountable {
	constructor(plugin: IPlugin, uuid: string, filePath: string) {
		super(plugin, uuid, filePath);
	}

	protected onMount(targetEl: HTMLElement): void {
		console.debug('meta-bind | ExcludedMountable >> mount');
		super.onMount(targetEl);

		DomHelpers.empty(targetEl);

		DomHelpers.createElement(targetEl, 'span', {
			text: '[META_BIND] This folder has been excluded in the settings',
			class: 'mb-error',
		});
	}

	protected onUnmount(targetEl: HTMLElement): void {
		console.debug('meta-bind | ExcludedMountable >> unmount');
		super.onUnmount(targetEl);

		DomHelpers.empty(targetEl);

		showUnloadedMessage(targetEl, 'Excluded');
	}
}
