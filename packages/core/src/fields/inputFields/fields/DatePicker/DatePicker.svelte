<script lang="ts">
	import type { Moment } from 'moment';
	import moment from 'moment';
	import Calender from 'packages/core/src/fields/inputFields/fields/DatePicker/Calender.svelte';
	import { getMonthName } from 'packages/core/src/utils/DatePickerUtils.js';

	let {
		selectedDate = moment(),
		dateChangeCallback,
	}: {
		selectedDate: Moment | null;
		dateChangeCallback: (date: Moment | null) => void;
	} = $props();

	let month = $state(0);
	let year = $state(0);

	// so that these change with props
	$effect(() => {
		if (selectedDate) {
			month = selectedDate.month();
			year = selectedDate.year();
		} else {
			const now = moment();
			month = now.month();
			year = now.year();
		}
	});

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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function changeYear(value: any): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const v = value.target.value as string;
		const vNum = Number.parseInt(v);
		if (!Number.isNaN(vNum)) {
			year = vNum;
		}
	}

	function onDateChange(date: Moment): void {
		selectedDate = date;
		dateChangeCallback(date);
	}

	function setDateToNull(): void {
		selectedDate = null;
		dateChangeCallback(null);
	}

	function setDateToCurrent(): void {
		selectedDate = moment();
		dateChangeCallback(selectedDate);
	}
</script>

<div class="mb-date-picker">
	<div class="mb-date-picker-header">
		<button class="mb-date-picker-month-switch-button" onclick={prevMonth}>Prev</button>
		<div class="mb-date-picker-header-text">
			<span class="mb-date-picker-header-text-month">{getMonthName(month)}</span>
			<input class="mb-date-picker-header-text-year" type="number" value={year.toString()} oninput={changeYear} />
		</div>
		<button class="mb-date-picker-month-switch-button" onclick={nextMonth}>Next</button>
	</div>
	<Calender dateChange={onDateChange} month={month} year={year} selectedDate={selectedDate}></Calender>
	<div class="mb-date-picker-footer">
		<button class="mb-date-picker-util-button" onclick={setDateToNull}>Set no Date</button>
		<button class="mb-date-picker-util-button" onclick={setDateToCurrent}>Set to Now</button>
	</div>
</div>
