<script lang='ts'>
	import { clamp, remapRange } from '../../../utils/Utils';

	export let onValueChange: (value: any) => void;
	export let value: number;
	export let minValue: number;
	export let maxValue: number;
	export let stepSize: number;


	let drag: boolean = false;
	let progressBarEl: HTMLDivElement;
	let keydownAcceleration: number = 0;
	let accelerationTimer: number | undefined = undefined;

	export function setValue(v: number) {
		value = v;
	}

	function setValueInternal(v: number) {
		value = v;
		onValueChange(v);
	}

	function getProgressPercent(v: number): number {
		v = clamp(v, minValue, maxValue);
		return remapRange(v, minValue, maxValue, 0, 100);
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

		let value = remapRange(clientX, boundingRect.left, boundingRect.right, minValue, maxValue);
		value = round(value, stepSize);

		setValueInternal(value);
	}

	function round(number: number, increment: number) {
		// the parsing is done to fix floating point errors
		return Number.parseFloat((Math.round(number / increment ) * increment).toFixed(15));
	}

	function onKeyPress(e: KeyboardEvent) {
		if (keydownAcceleration < 50) {
			keydownAcceleration += 1;
		}

		let throttled = Math.ceil(keydownAcceleration / 5);

		if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
			let newValue = clamp(value + throttled, minValue, maxValue);
			setValueInternal(newValue);
		}
		if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
			let newValue = clamp(value - throttled, minValue, maxValue);
			setValueInternal(newValue);
		}

		// Reset acceleration after 100ms of no events
		window.clearTimeout(accelerationTimer);
		accelerationTimer = window.setTimeout(() => (keydownAcceleration = 1), 100);
	}


</script>

<style>
    .mb-progress-bar-input {
        height:        32px;
        width:         100%;
        border-radius: var(--mb-border-radius);
        border:        var(--mb-border-width) solid var(--background-modifier-border);
        position:      relative;
        cursor:        col-resize;
    }

    .mb-progress-bar-input:focus-visible {
        box-shadow: 0 0 0 3px var(--background-modifier-border-focus);
    }

    .mb-progress-bar-progress {
        height:        32px;
        background:    var(--color-accent);
        border-radius: var(--mb-border-radius);
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
	aria-valuemin={minValue}
	aria-valuemax={maxValue}
	aria-valuenow={value}
	on:keydown={onKeyPress}
	on:mousedown={onTrackEvent}
	on:touchstart={onTrackEvent}>
	<div class='mb-progress-bar-progress' style={`width: ${getProgressPercent(value)}%`}
		 on:dragstart={() => drag = true}></div>
	<span class='mb-progress-bar-value'>{value}</span>
	<span class='mb-progress-bar-label-left'>{minValue}</span>
	<span class='mb-progress-bar-label-right'>{maxValue}</span>
</div>
