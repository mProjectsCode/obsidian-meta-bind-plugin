<script lang="ts">
	import { ErrorCollection } from './ErrorCollection';
	import MetaBindErrorComponent from './MetaBindErrorComponent.svelte';

	export let errorCollection: ErrorCollection;
	export let declaration: string | undefined;
</script>

{#if declaration}
	<p><code class="language-none meta-bind-none">{declaration}</code></p>
{/if}

{#if errorCollection.hasErrors()}
	<h6>Errors</h6>
	<p>Errors caused the creation of the field to fail. Sometimes one error only occurs because of another.</p>
	{#each errorCollection.getErrors() as error}
		<MetaBindErrorComponent error={error}></MetaBindErrorComponent>
	{/each}
{/if}
{#if errorCollection.hasWarnings()}
	<h6>Warnings</h6>
	<p>
		Warnings will not cause the creation of a field to fail, but they indicate that a part of the declaration was
		invalid or uses deprecated functionality.
	</p>
	{#each errorCollection.getWarnings() as warning}
		<MetaBindErrorComponent error={warning}></MetaBindErrorComponent>
	{/each}
{/if}
