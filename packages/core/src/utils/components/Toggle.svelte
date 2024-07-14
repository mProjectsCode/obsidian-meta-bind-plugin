<script lang="ts">
	let {
		checked = $bindable(false),
	}: {
		checked?: boolean;
	} = $props();
</script>

<div
	class="checkbox-container"
	class:is-enabled={checked}
	role="switch"
	tabindex="0"
	aria-checked={checked}
	onclick={() => (checked = !checked)}
	onkeydown={e => {
		if (e.key === ' ') {
			checked = !checked;
		}
	}}
>
	<input type="checkbox" tabindex="-1" checked={checked} />
</div>
