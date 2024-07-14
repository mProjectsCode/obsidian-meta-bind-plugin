<script lang="ts">
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

	const props: InputFieldSvelteProps<boolean> = $props();

	let value = $state(props.value);

	export function setValue(v: boolean): void {
		value = v;
	}

	function toggleValue(): void {
		value = !value;
		props.onValueChange(value);
	}

	function toggleValueOnKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			toggleValue();
		}
	}
</script>

<div
	class="checkbox-container"
	class:is-enabled={value}
	role="switch"
	tabindex="0"
	aria-checked={value}
	onclick={() => toggleValue()}
	onkeypress={event => toggleValueOnKey(event)}
>
	<input type="checkbox" tabindex="-1" checked={value} />
</div>
