<script lang="ts">
	export let value: string;
	export let placeholder: string;
	export let limit: number | undefined;

	export let onValueChange: (value: string) => void;

	export function setValue(v: string): void {
		value = v;
	}
</script>

<textarea
	class="mb-input-textarea"
	tabindex="0"
	placeholder={placeholder}
	bind:value={value}
	maxlength={limit}
	on:input={() => onValueChange(value)}
></textarea>
