<script lang="ts">
	export let checked: boolean;
</script>

<div
	class="checkbox-container"
	class:is-enabled={checked}
	role="switch"
	tabindex="0"
	aria-checked={checked}
	on:click={() => (checked = !checked)}
>
	<input type="checkbox" tabindex="-1" checked={checked} />
</div>
