import type { MetaBind } from 'packages/core/src';
import { FieldMountable } from 'packages/core/src/fields/FieldMountable';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';

export class ExcludedMountable extends FieldMountable {
	constructor(mb: MetaBind, uuid: string, filePath: string) {
		super(mb, uuid, filePath);
	}

	protected onMount(targetEl: HTMLElement): void {
		MB_DEBUG && console.debug('meta-bind | ExcludedMountable >> mount');
		super.onMount(targetEl);

		DomHelpers.empty(targetEl);

		DomHelpers.createElement(targetEl, 'span', {
			text: '[META_BIND] This folder has been excluded in the settings',
			class: 'mb-error',
		});
	}

	protected onUnmount(targetEl: HTMLElement): void {
		MB_DEBUG && console.debug('meta-bind | ExcludedMountable >> unmount');
		super.onUnmount(targetEl);

		DomHelpers.empty(targetEl);

		showUnloadedMessage(targetEl, 'Excluded');
	}
}
