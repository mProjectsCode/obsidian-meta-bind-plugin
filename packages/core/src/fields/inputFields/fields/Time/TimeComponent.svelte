<script lang="ts">
	export let value: string;
	export let onValueChange: (value: string) => void;

	export function setValue(v: string): void {
		value = v;
	}
</script>

<input type="time" bind:value={value} on:input={() => onValueChange(value)} />
