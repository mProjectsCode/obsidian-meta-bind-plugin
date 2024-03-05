<script lang="ts">
	import { stringifyAndLinkUnknown } from 'packages/core/src/utils/Literal';
	import LinkComponent from 'packages/core/src/utils/components/LinkComponent.svelte';
	import ListWrapper from 'packages/core/src/utils/components/ListWrapper.svelte';
	import { MarkdownLink } from 'packages/core/src/parsers/MarkdownLinkParser';

	export let value: unknown = undefined;
	let parsedValue: string | MarkdownLink | (string | MarkdownLink)[];

	$: parsedValue = stringifyAndLinkUnknown(value, false);
</script>

{#if typeof parsedValue === 'string'}
	<span style="white-space: pre">{parsedValue}</span>
{:else if Array.isArray(parsedValue)}
	<span>
		<ListWrapper elements={parsedValue} let:element>
			{#if typeof element === 'string'}
				<span>{element}</span>
			{:else}
				<LinkComponent mdLink={element}></LinkComponent>
			{/if}
		</ListWrapper>
	</span>
{:else}
	<span><LinkComponent mdLink={parsedValue}></LinkComponent></span>
{/if}
