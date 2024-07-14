<script lang="ts">
	import type { TextPromptModalOptions } from 'packages/core/src/api/InternalAPI';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import ModalButtonGroup from 'packages/core/src/utils/components/ModalButtonGroup.svelte';

	const {
		options,
	}: {
		options: TextPromptModalOptions;
	} = $props();

	let value = $state(options.value);
</script>

<p>
	{options.subTitle}
</p>

<div class="mb-full-width-text-input">
	{#if options.multiline}
		<textarea bind:value={value}></textarea>
	{:else}
		<input type="text" bind:value={value} />
	{/if}
</div>

<ModalButtonGroup>
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => options.onSubmit(value)}>OK</Button>
	<Button onclick={() => options.onCancel()}>Cancel</Button>
</ModalButtonGroup>
