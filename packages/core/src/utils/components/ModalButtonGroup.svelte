<!-- Inspired by https://github.com/marcusolsson/obsidian-svelte -->

<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		children,
	}: {
		children: Snippet;
	} = $props();
</script>

<div class="modal-button-container">
	{@render children()}
</div>
