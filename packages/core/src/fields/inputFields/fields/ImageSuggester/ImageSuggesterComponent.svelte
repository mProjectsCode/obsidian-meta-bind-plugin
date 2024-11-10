<script lang="ts">
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';

	const props: InputFieldSvelteProps<string> & {
		showSuggester: () => void;
	} = $props();

	let value = $state(props.value);

	export function setValue(v: string): void {
		value = v;
	}

	function openSuggester(): void {
		props.showSuggester();
	}
</script>

<div class="mb-image-card">
	{#if value}
		<img
			class="mb-image-card-image"
			src={props.plugin.internal.imagePathToUri(value)}
			alt={value}
			aria-label={value}
		/>
	{/if}
	<Button
		variant={ButtonStyleType.PLAIN}
		onclick={openSuggester}
		classes="mb-image-card-button"
		tooltip="Change image"
	>
		<Icon iconName="pencil" plugin={props.plugin} />
	</Button>
</div>
