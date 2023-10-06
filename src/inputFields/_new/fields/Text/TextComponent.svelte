<script lang="ts">
	export let value: string;
	export let placeholder: string;
	export let onValueChange: (value: string) => void;

	export function setValue(v: string): void {
		value = v;
	}
</script>

<input type="text" tabindex="0" placeholder={placeholder} bind:value={value} on:input={() => onValueChange(value)}>
