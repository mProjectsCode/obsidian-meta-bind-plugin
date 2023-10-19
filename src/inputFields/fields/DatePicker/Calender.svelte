<script lang='ts'>
	import { genSvelteId, getDateRows, getWeekDays } from './DatePickerInputSvelteHelpers.js';
	import { createEventDispatcher } from 'svelte';
	import { moment } from 'obsidian';
	import type { Moment } from 'moment';

	const dispatch = createEventDispatcher();

	// props
	export let selectedDate: Moment | null;
	export let month: number;
	export let year: number;

	// local vars to help in render
	let cells: number[];

	// function helpers
	function onChange(date: number) {
		dispatch('dateChange', moment(new Date(year, month, date)));
	}

	function selectCell(value: number | undefined) {
		if (value) {
			onChange(value);
		}
	}

	function selectCellKey(event: KeyboardEvent, value: number | undefined) {
		if (event.key === ' ') {
			selectCell(value);
		}
	}

	$: cells = getDateRows(month, year);
</script>

<style>
	.calendar {
		margin-top: 10px;
	}

	.calendar-header {
		display:         flex;
		justify-content: space-around;
		flex-wrap:       wrap;
		gap:             var(--size-4-1);
		background:      var(--background-secondary);
		border-radius:   var(--mb-border-radius);
		margin-bottom:   var(--size-4-1);;
	}

	.calendar-content {
		display:               grid;
		flex-wrap:             wrap;
		grid-template-columns: repeat(7, 1fr);
		gap:                   var(--size-4-1);
	}

	.cell {
		min-width:       40px;
		padding:         var(--size-4-2);
		display:         flex;
		justify-content: center;
		align-items:     center;
		border-radius:   var(--mb-border-radius);
	}

	.content-cell {
		cursor: pointer;
	}

	.cell-text {
		margin:     auto;
		text-align: center;
	}

	.selected {
		background: var(--interactive-accent);
		color:      var(--text-on-accent);
	}

	.highlight:hover {
		background: var(--interactive-hover);
	}

	.selected.highlight:hover {
		background: var(--interactive-accent-hover);
	}
</style>

<div class='calendar'>
	<div class='calendar-header'>
		{#each getWeekDays() as day}
			<div class='cell header-cell'>
				<span class='cell-text'>{day}</span>
			</div>
		{/each}
	</div>

	<div class='calendar-content'>
		{#each cells as value (genSvelteId())}
			<div
				class='cell'
				on:click={() => selectCell(value)}
				on:keydown={(event) => selectCellKey(event, value)}
				role='button'
				tabindex='0'
				class:highlight={value}
				class:content-cell={value}
				class:selected={selectedDate?.year() === year && selectedDate?.month() === month && selectedDate?.date() === value}>
				<span class='cell-text'>{value || ''}</span>
			</div>
		{/each}
	</div>
</div>
