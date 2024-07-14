<script lang="ts">
	import type { MarkdownLink } from 'packages/core/src/parsers/MarkdownLinkParser';
	import LinkComponent from 'packages/core/src/utils/components/LinkComponent.svelte';
	import ListWrapper from 'packages/core/src/utils/components/ListWrapper.svelte';
	import { stringifyAndLinkUnknown } from 'packages/core/src/utils/Literal';

	const { value = undefined }: { value?: unknown } = $props();

	let parsedValue: string | MarkdownLink | (string | MarkdownLink)[] = $derived(
		stringifyAndLinkUnknown(value, false),
	);
</script>

{#if typeof parsedValue === 'string'}
	<span style="white-space: pre">{parsedValue}</span>
{:else if Array.isArray(parsedValue)}
	<span>
		<ListWrapper elements={parsedValue}>
			{#snippet children(element)}
				{#if typeof element === 'string'}
					<span>{element}</span>
				{:else}
					<LinkComponent mdLink={element}></LinkComponent>
				{/if}
			{/snippet}
		</ListWrapper>
	</span>
{:else}
	<span><LinkComponent mdLink={parsedValue}></LinkComponent></span>
{/if}
