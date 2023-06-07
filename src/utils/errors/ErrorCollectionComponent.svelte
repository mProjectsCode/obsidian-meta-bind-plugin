<script lang="ts">

	import {ErrorCollection} from './ErrorCollection';

	export let errorCollection: ErrorCollection;
	export let declaration: string;
</script>

<p><code class="language-none meta-bind-none">{declaration}</code></p>

{#if errorCollection.hasWarnings()}
	<h6>Warnings</h6>
	{#each errorCollection.getWarnings() as warning}
		<p><code class="language-none meta-bind-none">{warning.message}</code></p>
	{/each}
{/if}
{#if errorCollection.hasErrors()}
	<h6>Errors</h6>
	{#each errorCollection.getErrors() as error}
		<p><code class="language-none meta-bind-none">{error.message}</code></p>
	{/each}
{/if}
