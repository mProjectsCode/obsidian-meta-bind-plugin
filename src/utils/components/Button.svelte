<!-- Inspired by https://github.com/marcusolsson/obsidian-svelte -->

<script lang="ts">
	type ButtonVariant = 'default' | 'destructive' | 'primary' | 'plain';

	export let variant: ButtonVariant = 'default';
	export let disabled: boolean = false;
	export let tooltip: string = '';
</script>

<button
	class:mod-cta={variant === 'primary'}
	class:mod-warning={variant === 'destructive'}
	class:mod-plain={variant === 'plain'}
	class:disabled={disabled}
	aria-label={tooltip}
	on:click
	disabled={disabled}
>
	<slot />
</button>

<style>
	button {
		/* Add a gap between text and icons. */
		gap: var(--size-4-1);
	}

	.mod-plain {
		background: none;
		box-shadow: none;
		border: none;

		color: var(--text-muted);
	}

	.mod-plain:hover {
		color: var(--text-normal);
	}

	.disabled {
		opacity: 0.6;
	}
</style>
