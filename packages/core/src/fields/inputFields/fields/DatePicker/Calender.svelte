<script lang="ts">
	import { genSvelteId, getDateRows, getWeekDays } from '../../../../utils/DatePickerUtils.js';
	import type { Moment } from 'moment';
	import moment from 'moment';

	let {
		selectedDate,
		month,
		year,
		dateChange,
	}: {
		selectedDate: Moment | null;
		month: number;
		year: number;
		dateChange: (date: Moment) => void;
	} = $props();

	// local vars to help in render
	let cells = $derived(getDateRows(month, year));

	function selectCell(value: number | undefined) {
		if (value) {
			dateChange(moment(new Date(year, month, value)));
		}
	}

	function selectCellKey(event: KeyboardEvent, date: number) {
		if (event.key === ' ') {
			selectCell(date);
		}
	}
</script>

<div class="mb-calendar">
	<div class="mb-calendar-header">
		{#each getWeekDays() as day}
			<div class="mb-calendar-cell mb-calendar-header-cell">
				<span class="mb-calendar-cell-text">{day}</span>
			</div>
		{/each}
	</div>

	<div class="mb-calendar-content">
		{#each cells as value (genSvelteId())}
			<div
				class="mb-calendar-cell"
				onclick={() => selectCell(value)}
				onkeydown={event => selectCellKey(event, value)}
				role="button"
				tabindex="0"
				class:mb-calendar-highlight={value}
				class:mb-calendar-content-cell={value}
				class:mb-calendar-selected={selectedDate?.year() === year &&
					selectedDate?.month() === month &&
					selectedDate?.date() === value}
			>
				<span class="mb-calendar-cell-text">{value || ''}</span>
			</div>
		{/each}
	</div>
</div>
