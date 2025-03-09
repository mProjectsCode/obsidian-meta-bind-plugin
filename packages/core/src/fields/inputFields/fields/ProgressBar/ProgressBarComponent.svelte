<script lang="ts">
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
	import { clamp, remapRange } from 'packages/core/src/utils/Utils';

	const props: InputFieldSvelteProps<number> & {
		minValue: number;
		maxValue: number;
		stepSize: number;
		addLabels: boolean;
	} = $props();

	let value = $state(props.value);

	let drag: boolean = false;
	let progressBarEl: HTMLDivElement;
	let keydownAcceleration: number = 0;
	let accelerationTimer: number | undefined = undefined;

	export function setValue(v: number): void {
		value = v;
	}

	function setValueInternal(v: number): void {
		value = v;
		props.onValueChange(v);
	}

	function getProgressPercent(v: number): number {
		v = clamp(v, props.minValue, props.maxValue);
		return remapRange(v, props.minValue, props.maxValue, 0, 100);
	}

	function onDragStart(): void {
		drag = true;
	}

	function onDragEnd(): void {
		drag = false;
	}

	function onTrackEvent(e: MouseEvent | TouchEvent): void {
		// Update value immediately before beginning drag
		onDragStart();
		updateValueOnEvent(e);
	}

	function updateValueOnEvent(e: MouseEvent | TouchEvent): void {
		if (!drag) {
			return;
		}

		if (e.stopPropagation) {
			e.stopPropagation();
		}
		if (e.preventDefault) {
			e.preventDefault();
		}

		// Get client's x cord either touch or mouse
		const clientX = e instanceof TouchEvent ? e.touches[0].clientX : e.clientX;

		calculateNewValue(clientX);
	}

	function calculateNewValue(clientX: number): void {
		const boundingRect = progressBarEl.getBoundingClientRect();

		clientX = clamp(clientX, boundingRect.left, boundingRect.right);

		let value = remapRange(clientX, boundingRect.left, boundingRect.right, props.minValue, props.maxValue);
		value = round(value, props.stepSize);

		setValueInternal(value);
	}

	function round(number: number, increment: number): number {
		// the parsing is done to fix floating point errors
		return Number.parseFloat((Math.round(number / increment) * increment).toFixed(10));
	}

	function onKeyPress(e: KeyboardEvent): void {
		if (keydownAcceleration < 50) {
			keydownAcceleration += 1;
		}

		let throttled = Math.ceil(keydownAcceleration / 5);

		if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
			let newValue = clamp(value + throttled, props.minValue, props.maxValue);
			setValueInternal(newValue);
		}
		if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
			let newValue = clamp(value - throttled, props.minValue, props.maxValue);
			setValueInternal(newValue);
		}

		// Reset acceleration after 100ms of no events
		window.clearTimeout(accelerationTimer);
		accelerationTimer = window.setTimeout(() => (keydownAcceleration = 1), 100);
	}
</script>

<svelte:window
	on:touchmove|nonpassive={updateValueOnEvent}
	on:touchcancel={onDragEnd}
	on:touchend={onDragEnd}
	on:mousemove={updateValueOnEvent}
	on:mouseup={onDragEnd}
/>

<div
	class="mb-progress-bar-input"
	tabindex="0"
	role="button"
	aria-label={value.toString()}
	bind:this={progressBarEl}
	onkeydown={onKeyPress}
	onmousedown={onTrackEvent}
	ontouchstart={onTrackEvent}
>
	<div
		class="mb-progress-bar-progress"
		style={`width: ${getProgressPercent(value)}%`}
		ondragstart={() => (drag = true)}
		role="slider"
		aria-valuemin={props.minValue}
		aria-valuemax={props.maxValue}
		aria-valuenow={value}
		tabindex="0"
	></div>
	{#if props.addLabels}
		<span class="mb-progress-bar-value">{value}</span>
		<span class="mb-progress-bar-label-left">{props.minValue}</span>
		<span class="mb-progress-bar-label-right">{props.maxValue}</span>
	{/if}
</div>
