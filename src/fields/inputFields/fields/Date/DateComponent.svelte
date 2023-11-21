<script lang="ts">
	import type { moment } from 'obsidian';
	import { onMount } from 'svelte';
	import { DateParser } from '../../../../parsers/DateParser';

	export let value: moment.Moment;
	export let useUsInputOrder: boolean;
	export let onValueChange: (value: moment.Moment) => void;

	let months: Record<string, string> = {};
	let days: Record<string, string> = {};

	let year: string;
	let month: string;
	let day: string;

	onMount(() => {
		months = {
			'0': 'January',
			'1': 'February',
			'2': 'March',
			'3': 'April',
			'4': 'May',
			'5': 'June',
			'6': 'July',
			'7': 'August',
			'8': 'September',
			'9': 'October',
			'10': 'November',
			'11': 'December',
		};

		for (let i = 1; i <= 31; i++) {
			days[i.toString()] = i.toString();
		}

		year = value.year().toString();
		month = value.month().toString();
		day = value.date().toString();
	});

	export function setValue(v: moment.Moment): void {
		value = v;

		year = value.year().toString();
		month = value.month().toString();
		day = value.date().toString();
	}

	function onYearChange(): void {
		const parseRes = Number.parseInt(year);
		const yearNumber = Number.isNaN(parseRes) ? DateParser.getDefaultYear() : parseRes;

		value.year(yearNumber);
		// year = yearNumber.toString();

		onValueChange(value);
	}

	function onMonthChange(): void {
		value.month(month);

		const clampedDay = clampDay(value.date());

		value.date(clampedDay);
		day = clampedDay.toString();

		onValueChange(value);
	}

	function onDayChange(): void {
		const parseRes = Number.parseInt(day);
		const clampedDay = clampDay(parseRes);

		value.date(clampedDay);
		day = clampedDay.toString();

		onValueChange(value);
	}

	function clampDay(day: number): number {
		if (Number.isNaN(day)) {
			return DateParser.getDefaultDay();
		} else if (day < 1) {
			return 1;
		} else if (day > value.daysInMonth()) {
			return value.daysInMonth();
		}
		return day;
	}
</script>

<div class="mb-input-element-group">
	{#if useUsInputOrder}
		<select class="dropdown mb-input-element-group-element" bind:value={month} on:change={() => onMonthChange()}>
			{#each Object.entries(months) as [_month, _monthName]}
				<option value={_month}>{_monthName}</option>
			{/each}
		</select>

		<select class="dropdown mb-input-element-group-element" bind:value={day} on:change={() => onDayChange()}>
			{#each Object.values(days) as _day}
				<option value={_day}>{_day}</option>
			{/each}
		</select>
	{:else}
		<select class="dropdown mb-input-element-group-element" bind:value={day} on:change={() => onDayChange()}>
			{#each Object.values(days) as _day}
				<option value={_day}>{_day}</option>
			{/each}
		</select>

		<select class="dropdown mb-input-element-group-element" bind:value={month} on:change={() => onMonthChange()}>
			{#each Object.entries(months) as [_month, _monthName]}
				<option value={_month}>{_monthName}</option>
			{/each}
		</select>
	{/if}

	<input
		class="mb-date-input-year-input mb-input-element-group-element"
		type="number"
		tabindex="0"
		bind:value={year}
		on:input={() => onYearChange()}
		max="9999"
		min="0"
	/>
</div>
