<script lang="ts">
	export let reverse: boolean = false;
	export let stretchChildren: boolean = true;
</script>

<div class={(reverse ? 'mb-flex-row-reverse ' : 'mb-flex-row ') + (stretchChildren ? 'mb-flex-row-stretch ' : '')}>
	<slot />
</div>
