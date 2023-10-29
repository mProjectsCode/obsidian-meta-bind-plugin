<script lang='ts'>
	import type { moment } from 'obsidian';
	import Icon from '../../../utils/Icon.svelte';

	export let value: moment.Moment | null;
	export let dateFormat: string;
	export let showDatePicker: () => void;
	export let onValueChange: (value: moment.Moment | null) => void;

	export function setValue(v: moment.Moment | null): void {
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

<style>
    .date-picker-input {
        background:    var(--background-secondary);
        border-radius: var(--mb-border-radius);
        border:        var(--mb-border-width) solid var(--background-modifier-border);
        padding:       5px 5px 5px 7px;
        cursor:        pointer;
        position:      relative;
        color:         var(--text-normal);
        display:       inline-flex;
        align-items:   center;
        gap:           5px;
    }

    .date-picker-text {
        display: inline-block;
    }
</style>

<div
	class='date-picker-input'
	on:click={datePicker}
	on:keydown={datePickerKey}
	role='button'
	tabindex='0'
>
	<div class='date-picker-text'>
		<span>{value ? value.format(dateFormat) : "none"}</span>
	</div>
	<Icon iconName='calendar' />
</div>
