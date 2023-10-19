<script lang='ts'>

	import { ErrorCollection } from './ErrorCollection';

	export let errorCollection: ErrorCollection;
	export let declaration: string | undefined;
</script>

{#if declaration}
	<p><code class='language-none meta-bind-none'>{declaration}</code></p>
{/if}

{#if errorCollection.hasWarnings()}
	<h6>Warnings</h6>
	{#each errorCollection.getWarnings() as warning}
		<pre class='mb-pre'><code class='language-none mb-none'>{warning.message}</code></pre>
		<pre class='mb-pre'><code class='language-none mb-none'>{warning.stack}</code></pre>
	{/each}
{/if}
{#if errorCollection.hasErrors()}
	<h6>Errors</h6>
	{#each errorCollection.getErrors() as error}
		<pre class='mb-pre'><code class='language-none mb-none'>{error.message}</code></pre>
		<pre class='mb-pre'><code class='language-none mb-none'>{error.stack}</code></pre>
	{/each}
{/if}
