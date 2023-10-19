<script src='../../_new/fields/Slider/SliderIPF.ts'></script>
<script lang='ts'>
	import { ProgressBarInputField } from './ProgressBarInputField';
	import { clamp, remapRange } from '../../../utils/Utils';


	export let onValueChange: (value: any) => void;
	export let progressBarInput: ProgressBarInputField;
	export let value: number;


	let drag: boolean = false;
	let progressBarEl: HTMLDivElement;
	let keydownAcceleration: number = 0;
	let accelerationTimer = null;

	export function updateValue(v: number) {
		value = v;
	}

	function setValue(v: number) {
		value = v;
		onValueChange(v);
	}

	function getProgressPercent(v: number): number {
		v = clamp(v, progressBarInput.minValue, progressBarInput.maxValue);
		return remapRange(v, progressBarInput.minValue, progressBarInput.maxValue, 0, 100);
	}

	function onDragStart() {
		drag = true;
	}

	function onDragEnd() {
		drag = false;
	}

	function onTrackEvent(e: MouseEvent | TouchEvent) {
		// Update value immediately before beginning drag
		onDragStart();
		updateValueOnEvent(e);
	}

	function updateValueOnEvent(e: MouseEvent | TouchEvent) {
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

	function calculateNewValue(clientX: number) {
		const boundingRect = progressBarEl.getBoundingClientRect();

		clientX = clamp(clientX, boundingRect.left, boundingRect.right);

		let value = remapRange(clientX, boundingRect.left, boundingRect.right, progressBarInput.minValue, progressBarInput.maxValue);
		value = Math.round(value);

		setValue(value);
	}

	function onKeyPress(e) {
		if (keydownAcceleration < 50) keydownAcceleration++;
		let throttled = Math.ceil(keydownAcceleration / 5);

		if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
			let newValue = clamp(value + throttled, progressBarInput.minValue, progressBarInput.maxValue);
			setValue(newValue);
		}
		if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
			let newValue = clamp(value - throttled, progressBarInput.minValue, progressBarInput.maxValue);
			setValue(newValue);
		}

		// Reset acceleration after 100ms of no events
		clearTimeout(accelerationTimer);
		accelerationTimer = setTimeout(() => (keydownAcceleration = 1), 100);
	}


</script>

<style>
	.mb-progress-bar-input {
		height:        32px;
		width:         100%;
		border-radius: var(--meta-bind-plugin-border-radius);
		border:        var(--meta-bind-plugin-border-width) solid var(--background-modifier-border);
		position:      relative;
		cursor:        col-resize;
	}

	.mb-progress-bar-input:focus-visible {
		box-shadow: 0 0 0 3px var(--background-modifier-border-focus);
	}

	.mb-progress-bar-progress {
		height:        32px;
		background:    var(--color-accent);
		border-radius: var(--meta-bind-plugin-border-radius);
	}

	.mb-progress-bar-value {
		position:  absolute;
		top:       50%;
		left:      50%;
		transform: translate(-50%, -50%);
	}

	.mb-progress-bar-label-left {
		position:  absolute;
		top:       50%;
		transform: translate(0, -50%);
		left:      var(--size-4-2);
	}

	.mb-progress-bar-label-right {
		position:  absolute;
		top:       50%;
		transform: translate(0, -50%);
		right:     var(--size-4-2);
	}


</style>

<svelte:window
	on:touchmove|nonpassive={updateValueOnEvent}
	on:touchcancel={onDragEnd}
	on:touchend={onDragEnd}
	on:mousemove={updateValueOnEvent}
	on:mouseup={onDragEnd}
/>

<div
	class='mb-progress-bar-input'
	tabindex='0'
	bind:this={progressBarEl}
	role='slider'
	aria-valuemin={progressBarInput.minValue}
	aria-valuemax={progressBarInput.maxValue}
	aria-valuenow={value}
	on:keydown={onKeyPress}
	on:mousedown={onTrackEvent}
	on:touchstart={onTrackEvent}>
	<div class='mb-progress-bar-progress' style={`width: ${getProgressPercent(value)}%`}
		 on:dragstart={() => drag = true}></div>
	<span class='mb-progress-bar-value'>{value}</span>
	<span class='mb-progress-bar-label-left'>{progressBarInput.minValue}</span>
	<span class='mb-progress-bar-label-right'>{progressBarInput.maxValue}</span>
</div>
