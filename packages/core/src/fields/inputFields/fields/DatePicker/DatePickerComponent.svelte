<script lang="ts">
	import type { Moment } from 'moment';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

	const props: InputFieldSvelteProps<Moment | null> & {
		dateFormat: string;
		showDatePicker: () => void;
	} = $props();

	let value = $state(props.value);

	export function setValue(v: Moment | null): void {
		value = v;
	}

	function datePicker(event: MouseEvent) {
		props.showDatePicker();
	}

	function datePickerKey(event: KeyboardEvent) {
		if (event.key === ' ') {
			props.showDatePicker();
		}
	}
</script>

<div class="mb-date-picker-input" onclick={datePicker} onkeydown={datePickerKey} role="button" tabindex="0">
	<span class="mb-date-picker-text">{value ? value.format(props.dateFormat) : 'none'}</span>
	<Icon plugin={props.plugin} iconName="calendar" />
</div>
