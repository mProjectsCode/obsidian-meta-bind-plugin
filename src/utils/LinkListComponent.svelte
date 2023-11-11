<script lang="ts">
	import { MarkdownLink } from '../parsers/MarkdownLinkParser';
	import LinkComponent from './LinkComponent.svelte';

	export let mdLinkList: MarkdownLink[];
</script>

{#if mdLinkList.length === 0}
	<span></span>
{:else if mdLinkList.length === 1}
	<LinkComponent mdLink={mdLinkList[0]}></LinkComponent>
{:else}
	{#each mdLinkList.slice(0, mdLinkList.length - 1) as link}
		<LinkComponent mdLink={link}></LinkComponent>,
	{/each}
	<LinkComponent mdLink={mdLinkList[mdLinkList.length - 1]}></LinkComponent>
{/if}
