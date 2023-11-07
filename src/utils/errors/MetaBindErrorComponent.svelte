<script lang="ts">
	import { ErrorLevel, MetaBindError } from './MetaBindErrors';

	export let error: MetaBindError | Error;
</script>

{#if error instanceof MetaBindError}
	<div class="mb-card mb-card-full-width markdown-rendered">
		<h6>
			<span class={error.errorLevel === ErrorLevel.WARNING ? 'mb-warning-text' : 'mb-error-text'}
				>{error.errorLevel}
				[{error.getErrorType()}]</span
			>
			- {error.effect}
		</h6>
		{#if error.positionContext}
			<pre class="mb-pre"><code class="language-none mb-none">{error.positionContext}</code></pre>
		{/if}
		<table>
			<tbody>
				<tr>
					<td>Cause</td>
					<td>{error.cause}</td>
				</tr>
				<tr>
					<td>Effect</td>
					<td>{error.effect}</td>
				</tr>
				{#if error.tip}
					<tr>
						<td>Tip</td>
						<td>{error.tip}</td>
					</tr>
				{/if}
				{#if error.docs}
					<tr>
						<td>Docs</td>
						<td>
							{#each error.docs as doc}
								<a href={doc}>{doc}</a><br />
							{/each}
						</td>
					</tr>
				{/if}
				{#if error.context}
					<tr>
						<td>Context</td>
						<td>
							<pre class="mb-pre"><code class="language-none mb-none">{JSON.stringify(error.context, null, 4)}</code></pre>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
{:else}
	<div class="mb-card">
		<pre class="mb-pre"><code class="language-none mb-none">{error.stack}</code></pre>
	</div>
{/if}
