<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Calender from "./Calender.svelte";
    import { getMonthName } from "./DatePickerInputSvelteHelpers.js";
	import {moment} from 'obsidian';

    const dispatch = createEventDispatcher();

    // props
    export let selectedDate: moment.Moment = moment();
	export let dateChangeCallback: (date: moment.Moment) => void;

    // state
    let date;
    let month;
    let year;
    let showDatePicker;

    // so that these change with props
    $: {
        // console.log('update date picker', selectedDate);
        date = selectedDate.date();
        month = selectedDate.month();
        year = selectedDate.year();
    }

    // handlers
    function onFocus() {
        showDatePicker = true;
    }

    function next () {
        if (month === 11) {
            month = 0;
            year += 1;
            return;
        }
        month = month + 1;
    }

    function prev() {
        if (month === 0) {
            month = 11;
            year -= 1;
            return;
        }
        month -= 1;
    }

    function onDateChange(d: {detail: moment.Moment}) {
        showDatePicker = false;
		selectedDate = d.detail;
        dateChangeCallback(d.detail);
    }
</script>

<style>
    .date-picker-input {
        position: relative;
		color: var(--text-normal);
    }

    .date-picker {
        position: absolute;
        top: 30px;
        left: 0;
        display: inline-block;
		background: var(--background-secondary);
		border-radius: var(--meta-bind-plugin-border-radius);
		border: var(--meta-bind-plugin-border-width) solid var(--background-modifier-border);
		padding: 10px;
		z-index: 1000000;
    }

    .date-picker-header {
        display: flex;
        justify-content: center;
        align-items: center;
    }

	.date-picker-header-text {
		flex: 1;
		text-align: center;
	}

	.month-switch-button {
		margin: 0;
	}
</style>

<div class="date-picker-input">
    <div on:click={() => showDatePicker = true}>{selectedDate.format('dddd, MMMM Do YYYY')}</div>
    {#if showDatePicker}
        <div class="date-picker">
            <div class="date-picker-header">
				<button class="month-switch-button" on:click={prev}>Prev</button>
                <div class="date-picker-header-text">
					{getMonthName(month)} {year}
				</div>
				<button class="month-switch-button" on:click={next}>Next</button>
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
