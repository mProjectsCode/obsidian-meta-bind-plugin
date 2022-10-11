<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import Calender from './Calender.svelte';
	import {getMonthName} from './DatePickerInputSvelteHelpers.js';
	import {moment} from 'obsidian';
	import type {Moment} from 'moment';
	import Icon from './Icon.svelte';

	const dispatch = createEventDispatcher();

	export let selectedDate: Moment = moment();
	export let dateFormat: string = 'dddd, MMMM Do YYYY';
	export let dateChangeCallback: (date: Moment) => void;

	export let alignRight: boolean;

	let date: number;
	let month: number;
	let year: number;
	let showDatePicker: boolean;

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
		showDatePicker = false;
		selectedDate = d.detail;
		dateChangeCallback(d.detail);
	}
</script>

<style>
	.date-picker-input {
		position: relative;
		color:    var(--text-normal);
		display:  inline-block;
	}

	.date-picker {
		position:      absolute;
		top:           35px;
		display:       inline-block;
		background:    var(--background-secondary);
		border-radius: var(--meta-bind-plugin-border-radius);
		border:        var(--meta-bind-plugin-border-width) solid var(--background-modifier-border);
		padding:       10px;
		z-index:       1000000;
	}

	.date-picker-text {
		background:    var(--background-secondary);
		border-radius: var(--meta-bind-plugin-border-radius);
		border:        var(--meta-bind-plugin-border-width) solid var(--background-modifier-border);
		padding:       5px 5px 5px 7px;
		cursor:        pointer;
		width:         fit-content;
		display:       inline-block;
	}

	.date-picker-close-layer {
		position: fixed;
		top:      0;
		left:     0;
		width:    100vw;
		height:   100vh;
		z-index:  900000; /* so it overlays everything except the date picker*/
	}

	.date-picker-header {
		display:         flex;
		gap:             5px;
		align-items:     center;
		justify-content: space-around;
	}

	.date-picker-header-text {
		flex:            1;
		text-align:      center;
		display:         flex;
		gap:             5px;
		align-items:     center;
		justify-content: center;
		width:           min-content;
	}

	.date-picker-header-text-year {
		width:   60px;
		padding: 5px;
	}

	.date-picker-header-text-month {
		height: min-content;
	}

	.month-switch-button {
		margin: 0;
	}
</style>

<div class="date-picker-input">
	<div class="date-picker-text" on:click={() => showDatePicker = true}>
		{selectedDate.format(dateFormat)}
		<Icon iconName="calendar"/>
	</div>
	{#if showDatePicker}
		<div class="date-picker-close-layer" on:click={() => showDatePicker = false}></div>
		<div class="date-picker" style="{alignRight ? 'left: auto; right: 0;' : 'right: auto; left: 0;'}">
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
	{/if}
</div>
