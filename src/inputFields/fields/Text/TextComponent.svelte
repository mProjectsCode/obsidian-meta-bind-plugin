<script lang="ts">
	export let value: string;
	export let placeholder: string;
	export let limit: number | undefined;
	export let onValueChange: (value: string) => void;

	export function setValue(v: string): void {
		value = v;
	}

	function getLimitString(length: number, limit: number) {
		const limitStr = limit.toString();
		const lengthStr = length.toString().padStart(limitStr.length, '0');
		return `${lengthStr}/${limitStr}`;
	}
</script>

<input
	type="text"
	tabindex="0"
	placeholder={placeholder}
	bind:value={value}
	maxlength={limit}
	on:input={() => onValueChange(value)}
/>
{#if limit !== undefined}
	<span class={`mb-content-limit-indicator ${value.length > limit ? 'mb-content-limit-indicator-overflow' : ''}`}
		>{getLimitString(value.length, limit)}</span
	>
{/if}
