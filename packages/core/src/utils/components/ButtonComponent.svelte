<!-- Inspired by https://github.com/marcusolsson/obsidian-svelte -->

<script lang="ts">
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';

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

	async function click(): Promise<void> {
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
	class:mod-cta={variant === ButtonStyleType.PRIMARY}
	class:mod-warning={variant === ButtonStyleType.DESTRUCTIVE}
	class:mod-plain={variant === ButtonStyleType.PLAIN}
	class:disabled={disabled}
	class:mb-error={error}
	aria-label={tooltip}
	onclick={click}
	disabled={disabled}
>
	{#if icon}
		<Icon plugin={plugin} iconName={icon}></Icon>
	{/if}
	{label}
</button>
