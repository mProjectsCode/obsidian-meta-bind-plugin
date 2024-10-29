<script lang="ts">
	let {
		checked = $bindable(),
	}: {
		checked?: boolean;
	} = $props();

	let boolChecked = $derived(checked ?? false);
</script>

<div
	class="checkbox-container"
	class:is-enabled={boolChecked}
	role="switch"
	tabindex="0"
	aria-checked={boolChecked}
	onclick={() => (checked = !boolChecked)}
	onkeydown={e => {
		if (e.key === ' ') {
			checked = !boolChecked;
		}
	}}
>
	<input type="checkbox" tabindex="-1" checked={boolChecked} />
</div>
