<script lang="ts">
	import {moment} from 'obsidian';
	import type {Moment} from 'moment';
	import Icon from '../../../utils/Icon.svelte';

	export let showDatePicker: () => void;

	export let selectedDate: Moment = moment();
	export let dateFormat: string = 'dddd, MMMM Do YYYY';

	export function updateValue(value: Moment) {
		selectedDate = value;
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
		border-radius: var(--meta-bind-plugin-border-radius);
		border:        var(--meta-bind-plugin-border-width) solid var(--background-modifier-border);
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
	class="date-picker-input"
	on:click={datePicker}
	on:keydown={datePickerKey}>
	<div class="date-picker-text">
		<span>{selectedDate.format(dateFormat)}</span>
	</div>
	<Icon iconName="calendar"/>
</div>
