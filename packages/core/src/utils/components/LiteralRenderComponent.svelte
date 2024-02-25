<script lang="ts">
	import { stringifyAndLinkUnknown } from 'packages/core/src/utils/Literal';
	import LinkComponent from 'packages/core/src/utils/components/LinkComponent.svelte';
	import ListWrapper from 'packages/core/src/utils/components/ListWrapper.svelte';

	export let value = undefined;

	$: parsedValue = stringifyAndLinkUnknown(value);
</script>

{#if typeof parsedValue === 'string'}
	<span>{parsedValue}</span>
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
