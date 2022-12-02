<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import Calender from './Calender.svelte';
	import {getMonthName} from './DatePickerInputSvelteHelpers.js';
	import {moment} from 'obsidian';
	import type {Moment} from 'moment';

	const dispatch = createEventDispatcher();

	export let selectedDate: Moment = moment();
	export let dateChangeCallback: (date: Moment) => void;

	let date: number;
	let month: number;
	let year: number;
	let isDatePickerVisible: boolean;

	// so that these change with props
	$: {
		console.log('update date picker', selectedDate);
		date = selectedDate.date();
		month = selectedDate.month();
		year = selectedDate.year();
	}

	function nextMonth(): void {
		if (month === 11) {
			month = 0;
			year += 1;
			return;
		}
		month = month + 1;
	}

	function prevMonth(): void {
		if (month === 0) {
			month = 11;
			year -= 1;
			return;
		}
		month -= 1;
	}

	function changeYear(value: any): void {
		const v = value.target.value;
		const vNum = Number.parseInt(v);
		if (!Number.isNaN(vNum)) {
			year = vNum;
		}
	}

	function onDateChange(d: { detail: Moment }): void {
		isDatePickerVisible = false;
		selectedDate = d.detail;
		dateChangeCallback(d.detail);
	}
</script>

<style>

	.date-picker {
		display: block;
		padding: var(--size-4-4);
	}

	.date-picker-header {
		display:         flex;
		gap:             var(--size-4-2);
		align-items:     center;
		justify-content: space-around;
	}

	.date-picker-header-text {
		flex:            1;
		text-align:      center;
		display:         flex;
		gap:             var(--size-4-2);
		align-items:     center;
		justify-content: center;
		width:           min-content;
	}

	.date-picker-header-text-year {
		width:   60px;
		padding: var(--size-4-2);
	}

	.date-picker-header-text-month {
		height: min-content;
	}

	.month-switch-button {
		margin: 0;
	}
</style>

<div class="date-picker">
	<div class="date-picker-header">
		<button class="month-switch-button" on:click={prevMonth}>Prev</button>
		<div class="date-picker-header-text">
			<span class="date-picker-header-text-month">{getMonthName(month)}</span>
			<input class="date-picker-header-text-year" type="number" value="{year.toString()}"
				   on:input="{changeYear}">
		</div>
		<button class="month-switch-button" on:click={nextMonth}>Next</button>
	</div>
	<Calender
		on:dateChange={onDateChange}
		month={month}
		year={year}
		selectedDate={selectedDate}>
	</Calender>
</div>
