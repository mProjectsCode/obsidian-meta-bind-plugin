<script lang="ts">
	export let checked: boolean | undefined;
</script>

<div
	class="checkbox-container"
	class:is-enabled={checked ?? false}
	role="switch"
	tabindex="0"
	aria-checked={checked ?? false}
	on:click={() => (checked = !checked)}
	on:keydown={e => {
		if (e.key === ' ') {
			checked = !checked;
		}
	}}
>
	<input type="checkbox" tabindex="-1" checked={checked ?? false} />
</div>
