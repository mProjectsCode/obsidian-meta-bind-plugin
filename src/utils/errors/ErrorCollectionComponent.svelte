<script lang="ts">
	import MetaBindErrorComponent from './MetaBindErrorComponent.svelte';
	import { ErrorCollectionModalSettings } from './ErrorCollectionViewModal';

	export let settings: ErrorCollectionModalSettings;
</script>

{#if settings.text}
	<p>{settings.text}</p>
{/if}

{#if settings.code}
	<p><code class="language-none meta-bind-none">{settings.code}</code></p>
{/if}

{#if settings.errorCollection.hasErrors()}
	<h6>Errors</h6>
	{#if settings.errorText}
		<p>{settings.errorText}</p>
	{/if}
	{#each settings.errorCollection.getErrors() as error}
		<MetaBindErrorComponent error={error}></MetaBindErrorComponent>
	{/each}
{/if}
{#if settings.errorCollection.hasWarnings()}
	<h6>Warnings</h6>
	{#if settings.warningText}
		<p>{settings.warningText}</p>
	{/if}
	{#each settings.errorCollection.getWarnings() as warning}
		<MetaBindErrorComponent error={warning}></MetaBindErrorComponent>
	{/each}
{/if}
