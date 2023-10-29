<script lang='ts'>
	export let value: boolean;
	export let onValueChange: (value: boolean) => void;

	export function setValue(v: boolean): void {
		value = v;
	}

	function toggleValue() {
		value = !value;
		console.log('toggle');
		onValueChange(value);
	}

	function toggleValueOnKey(event: KeyboardEvent) {
		if (event.key === ' ') {
			toggleValue();
		}
	}
</script>

<div class='checkbox-container' class:is-enabled={value} role='switch' tabindex='0' aria-checked={value}
	 on:click={() => toggleValue()} on:keypress={(event) => toggleValueOnKey(event)}>
	<input type='checkbox' tabindex='-1' checked={value}>
</div>
