<script lang="ts">
	import type { Moment } from 'moment';
	import Icon from '../../../../utils/components/Icon.svelte';
	import { IPlugin } from '../../../../IPlugin';

	export let plugin: IPlugin;
	export let value: Moment | null;
	export let dateFormat: string;
	export let showDatePicker: () => void;
	export let onValueChange: (value: Moment | null) => void;

	export function setValue(v: Moment | null): void {
		value = v;
	}

	function datePicker(event: MouseEvent) {
		showDatePicker();
	}

	function datePickerKey(event: KeyboardEvent) {
		if (event.key === ' ') {
			showDatePicker();
		}
	}
</script>

<div class="date-picker-input" on:click={datePicker} on:keydown={datePickerKey} role="button" tabindex="0">
	<span class="date-picker-text">{value ? value.format(dateFormat) : 'none'}</span>
	<Icon plugin={plugin} iconName="calendar" />
</div>
