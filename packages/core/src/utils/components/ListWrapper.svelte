<script lang="ts">
	export let elements: unknown[] = [];
</script>

{#each elements.slice(0, elements.length - 1) as element}
	<slot element={element} />
	<span>,</span>
	<span></span>
	<!-- some strange line breaks to get the comma seperated spacing to work -->
{/each}
<slot element={elements[elements.length - 1]} />
