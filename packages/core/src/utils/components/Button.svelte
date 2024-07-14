<!-- Inspired by https://github.com/marcusolsson/obsidian-svelte -->

<script lang="ts">
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { Snippet } from 'svelte';

	const {
		variant = ButtonStyleType.DEFAULT,
		disabled = false,
		tooltip = '',
		onclick = () => {},
		children,
	}: {
		variant?: ButtonStyleType;
		disabled?: boolean;
		tooltip?: string;
		onclick?: (e: MouseEvent) => void | Promise<void>;
		children: Snippet;
	} = $props();
</script>

<button
	class="mb-button-inner"
	class:mod-cta={variant === 'primary'}
	class:mod-warning={variant === 'destructive'}
	class:mod-plain={variant === 'plain'}
	class:disabled={disabled}
	aria-label={tooltip}
	onclick={onclick}
	disabled={disabled}
>
	{@render children()}
</button>
