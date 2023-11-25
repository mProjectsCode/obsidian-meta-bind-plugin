<!-- Inspired by https://github.com/marcusolsson/obsidian-svelte -->

<script lang="ts">
	import { ButtonStyleType } from '../../config/ButtonConfig';

	export let variant: ButtonStyleType = ButtonStyleType.DEFUALT;
	export let disabled: boolean = false;
	export let tooltip: string = '';
	export let label: string = '';
	export let onClick: () => Promise<void> = async () => {};

	async function click() {
		if (!disabled) {
			disabled = true;
			try {
				await onClick();
			} catch (e) {
				console.log('failed to run button component on click', e);
			} finally {
				disabled = false;
			}
		}
	}
</script>

<button
	class:mod-cta={variant === 'primary'}
	class:mod-warning={variant === 'destructive'}
	class:mod-plain={variant === 'plain'}
	class:disabled={disabled}
	aria-label={tooltip}
	on:click={() => click()}
	disabled={disabled}
>
	{label}
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
