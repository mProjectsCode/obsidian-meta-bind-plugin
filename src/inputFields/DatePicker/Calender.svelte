<script lang="ts">
	import {getDateRows, getWeekDays, uuid} from './DatePickerInputSvelteHelpers.js';
	import {createEventDispatcher} from 'svelte';
	import {moment} from 'obsidian';
	import type { Moment } from 'moment';

	const dispatch = createEventDispatcher();

	// props
	export let selectedDate: Moment;
	export let month: number;
	export let year: number;

	// local vars to help in render
	let cells;

	// function helpers
	function onChange(date: number) {
		dispatch('dateChange', moment(new Date(year, month, date)));
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
		gap:             2px;
		background:      var(--background-primary);
		border-radius:   var(--meta-bind-plugin-border-radius);
		margin-bottom:   2px;
	}

	.calendar-content {
		display:               grid;
		flex-wrap:             wrap;
		grid-template-columns: repeat(7, 1fr);
		gap:                   2px;
	}

	.cell {
		min-width:       40px;
		height:          30px;
		padding:         5px;
		display:         flex;
		justify-content: center;
		align-items:     center;
		border-radius:   var(--meta-bind-plugin-border-radius);
	}

	.content-cell {
		cursor: pointer;
	}

	.cell-text {
		margin:     auto;
		text-align: center;
	}

	.selected {
		background: var(--background-modifier-success);
	}

	.highlight:hover {
		background: var(--interactive-hover);
	}

	.selected.highlight:hover {
		background: green;
	}
</style>

<div class="calendar">
	<div class="calendar-header">
		{#each getWeekDays() as day}
			<div class="cell header-cell">
				<span class="cell-text">{day}</span>
			</div>
		{/each}
	</div>

	<div class="calendar-content">
		{#each cells as value (uuid())}
			<div
				class="cell"
				on:click={value ? () => onChange(value) : () => {}}
				class:highlight={value}
				class:content-cell={value}
				class:selected={selectedDate.year() === year && selectedDate.month() === month && selectedDate.date() === value}>
				<span class="cell-text">{value || ''}</span>
			</div>
		{/each}
	</div>
</div>
