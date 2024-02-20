<!--adapted from @joethei's code: https://github.com/joethei/obsidian-rss/blob/master/src/view/IconComponent.svelte-->
<!--adapted from @javalent's code: https://discord.com/channels/686053708261228577/840286264964022302/902949764209987654-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let iconName: string = '';
	export let plugin: IPlugin;

	let iconEl: HTMLElement;

	onMount(() => {
		plugin.internal.setIcon(iconEl, iconName);
	});
</script>

{#if iconName.length > 0}
	<div class="mb-icon-wrapper" bind:this={iconEl}></div>
{/if}
