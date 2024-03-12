<script lang="ts">
	import { IPlugin } from 'packages/core/src/IPlugin';
	import Button from '../../../../utils/components/Button.svelte';
	import { ButtonStyleType } from '../../../../config/ButtonConfig';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';

	export let plugin: IPlugin;

	export let value: string;
	export let showSuggester: () => void;
	export let onValueChange: (value: string) => void;

	export function setValue(v: string): void {
		value = v;
	}

	function openSuggester(event: MouseEvent) {
		showSuggester();
	}
</script>

<div class="mb-image-card">
	{#if value}
		<img class="mb-image-card-image" src={plugin.internal.imagePathToUri(value)} alt={value} />
	{/if}
	<div class="mb-image-card-footer">
		<span>{value || 'no image selected'}</span>
		<Button variant={ButtonStyleType.PLAIN} on:click={openSuggester}>
			<Icon iconName="pencil" plugin={plugin} />
		</Button>
	</div>
</div>
