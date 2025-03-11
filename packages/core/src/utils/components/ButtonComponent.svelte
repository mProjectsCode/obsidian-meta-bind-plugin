<!-- Inspired by https://github.com/marcusolsson/obsidian-svelte -->

<script lang="ts">
	import { ButtonClickType, ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import type { MetaBind } from '../..';

	let {
		mb,
		variant = ButtonStyleType.DEFAULT,
		disabled = false,
		tooltip = '',
		label = '',
		icon = '',
		cssStyle = '',
		backgroundImage = '',
		error = false,
		onclick = () => {},
		onauxclick = () => {},
	}: {
		mb: MetaBind;
		variant?: ButtonStyleType;
		disabled?: boolean;
		tooltip?: string;
		label?: string;
		icon?: string;
		cssStyle?: string;
		backgroundImage?: string;
		error?: boolean;
		onclick?: (event: MouseEvent) => void | Promise<void>;
		onauxclick?: (event: MouseEvent) => void | Promise<void>;
	} = $props();

	async function click(event: MouseEvent, clickType: ButtonClickType): Promise<void> {
		if (!disabled) {
			disabled = true;
			try {
				if (clickType === ButtonClickType.LEFT) {
					await onclick(event);
				} else if (clickType === ButtonClickType.MIDDLE) {
					await onauxclick(event);
				}
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
	style={cssStyle}
	style:background-image={backgroundImage ? `url("${backgroundImage}")` : undefined}
	aria-label={tooltip}
	disabled={disabled}
	onclick={event => click(event, ButtonClickType.LEFT)}
	onauxclick={event => click(event, ButtonClickType.MIDDLE)}
>
	{#if icon}
		<Icon mb={mb} iconName={icon}></Icon>
	{/if}
	{label}
</button>
