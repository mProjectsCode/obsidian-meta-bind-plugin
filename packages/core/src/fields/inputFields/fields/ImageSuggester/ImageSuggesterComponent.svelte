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
		<img class="mb-image-card-image" src={props.plugin.internal.imagePathToUri(value)} alt={value} />
	{/if}
	<div class="mb-image-card-footer">
		<span>{value || 'no image selected'}</span>
		<Button variant={ButtonStyleType.PLAIN} onclick={openSuggester}>
			<Icon iconName="pencil" plugin={props.plugin} />
		</Button>
	</div>
</div>
