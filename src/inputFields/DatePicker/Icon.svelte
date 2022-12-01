<!--adapted from @joethei's code: https://github.com/joethei/obsidian-rss/blob/master/src/view/IconComponent.svelte-->
<!--adapted from @javalent's code: https://discord.com/channels/686053708261228577/840286264964022302/902949764209987654-->
<script lang="ts">
	import {setIcon} from 'obsidian';
	import {onMount} from 'svelte';

	export let iconName: string = '';
	export let iconSize: number = 20;

	let iconEl: HTMLElement;

	onMount(() => {
		setIcon(iconEl, iconName, iconSize);
	});
</script>

<style>
	.icon-wrapper {
		display:  inline-block;
		position: relative;
		width:    20px;
	}

	.icon {
		position: absolute;
		height:   20px;
		width:    20px;
		bottom:   -6px;
	}
</style>

{#if iconName.length > 0}
	<div class="icon-wrapper">
		<div bind:this={iconEl} class="icon"></div>
	</div>
{/if}
