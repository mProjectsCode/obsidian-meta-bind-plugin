<script lang="ts">
	import { onMount } from 'svelte';
	import { Time } from '../../../parsers/TimeParser';

	export let value: Time;
	export let onValueChange: (value: Time) => void;

	let hours: Record<string, string> = {};
	let minutes: Record<string, string> = {};

	let hour: string;
	let minute: string;

	onMount(() => {
		for (let i = 0; i <= 24; i++) {
			hours[i.toString()] = i.toString().padStart(2, '0');
		}

		for (let i = 0; i <= 59; i++) {
			minutes[i.toString()] = i.toString().padStart(2, '0');
		}

		minute = value.getMinute().toString();
		hour = value.getHour().toString();
	});

	export function setValue(v: Time): void {
		value = v;

		minute = value.getMinute().toString();
		hour = value.getHour().toString();
	}

	function onMinuteChange(): void {
		value.setMinuteFromString(minute);

		onValueChange(value);
	}

	function onHourChange(): void {
		value.setHourFromString(hour);

		onValueChange(value);
	}
</script>

<div class="mb-input-element-group">
	<select class="dropdown mb-input-element-group-element" bind:value={hour} on:change={() => onHourChange()}>
		{#each Object.entries(hours) as [_hour, _hourName]}
			<option value={_hour}>{_hourName}</option>
		{/each}
	</select>

	<select class="dropdown mb-input-element-group-element" bind:value={minute} on:change={() => onMinuteChange()}>
		{#each Object.entries(minutes) as [_minute, _minuteName]}
			<option value={_minute}>{_minuteName}</option>
		{/each}
	</select>
</div>
