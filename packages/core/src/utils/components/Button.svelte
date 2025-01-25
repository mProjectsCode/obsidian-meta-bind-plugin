<!-- Inspired by https://github.com/marcusolsson/obsidian-svelte -->

<script lang="ts">
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { Snippet } from 'svelte';

	const {
		variant = ButtonStyleType.DEFAULT,
		disabled = false,
		tooltip = '',
		classes = '',
		onclick = () => {},
		children,
	}: {
		variant?: ButtonStyleType;
		disabled?: boolean;
		tooltip?: string;
		classes?: string;
		onclick?: (e: MouseEvent) => void | Promise<void>;
		children: Snippet;
	} = $props();
</script>

<button
	class="mb-button-inner {classes}"
	class:mod-cta={variant === ButtonStyleType.PRIMARY}
	class:mod-warning={variant === ButtonStyleType.DESTRUCTIVE}
	class:mod-plain={variant === ButtonStyleType.PLAIN}
	class:disabled={disabled}
	aria-label={tooltip}
	onclick={onclick}
	disabled={disabled}
>
	{@render children()}
</button>
