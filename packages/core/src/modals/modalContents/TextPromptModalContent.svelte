<script lang="ts">
	import type { TextPromptModalOptions } from 'packages/core/src/api/InternalAPI';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
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
	<Button variant={ButtonStyleType.PRIMARY} on:click={() => options.onSubmit(value)}>OK</Button>
	<Button on:click={() => options.onCancel()}>Cancel</Button>
</ModalButtonGroup>
