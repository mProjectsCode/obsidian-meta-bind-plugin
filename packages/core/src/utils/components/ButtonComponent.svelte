<!-- Inspired by https://github.com/marcusolsson/obsidian-svelte -->

<script lang="ts">
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import type { IPlugin } from 'packages/core/src/IPlugin';

	let {
		plugin,
		variant = ButtonStyleType.DEFAULT,
		disabled = false,
		tooltip = '',
		label = '',
		icon = '',
		error = false,
		onclick = () => {},
	}: {
		plugin: IPlugin;
		variant?: ButtonStyleType;
		disabled?: boolean;
		tooltip?: string;
		label?: string;
		icon?: string;
		error?: boolean;
		onclick?: () => void | Promise<void>;
	} = $props();

	async function click() {
		if (!disabled) {
			disabled = true;
			try {
				await onclick();
			} catch (e) {
				console.warn('failed to run button component on click', e);
			} finally {
				disabled = false;
			}
		}
	}
</script>

<button
	class="mb-button-inner"
	class:mod-cta={variant === 'primary'}
	class:mod-warning={variant === 'destructive'}
	class:mod-plain={variant === 'plain'}
	class:disabled={disabled}
	class:mb-error={error}
	aria-label={tooltip}
	onclick={onclick}
	disabled={disabled}
>
	{#if icon}
		<Icon plugin={plugin} iconName={icon}></Icon>
	{/if}
	{label}
</button>
