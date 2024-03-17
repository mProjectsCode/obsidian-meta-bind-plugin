import { FieldBase } from 'packages/core/src/fields/FieldBase';
import { type IPlugin } from 'packages/core/src/IPlugin';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';

export class ExcludedBase extends FieldBase {
	constructor(plugin: IPlugin, uuid: string, filePath: string) {
		super(plugin, uuid, filePath);
	}

	protected onMount(targetEl: HTMLElement): void {
		console.log('meta-bind | ExcludedBase >> mount');

		DomHelpers.empty(targetEl);

		DomHelpers.createElement(targetEl, 'span', {
			text: '[META_BIND] This folder has been excluded in the settings',
			class: 'mb-error',
		});
	}

	protected onUnmount(targetEl: HTMLElement): void {
		console.log('meta-bind | ExcludedBase >> unmount');

		DomHelpers.empty(targetEl);

		showUnloadedMessage(targetEl, 'Excluded');
	}
}
