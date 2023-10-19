<script lang='ts'>
	import { ErrorCollection } from '../utils/errors/ErrorCollection';
	import ErrorCollectionComponent from '../utils/errors/ErrorCollectionComponent.svelte';

	export let errorCollection: ErrorCollection;
	export let declaration: string;
	export let value: string;
	export let fieldType: string;

	let open: boolean = false;
</script>

<div class='meta-bind-error-collection' on:click={() => open = !open}>
	{#if errorCollection.hasErrors()}
		<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'
			 stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'
			 class='lucide lucide-alert-circle'>
			<circle cx='12' cy='12' r='10' />
			<line x1='12' x2='12' y1='8' y2='12' />
			<line x1='12' x2='12.01' y1='16' y2='16' />
		</svg>
	{:else if errorCollection.hasWarnings()}
		<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'
			 stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'
			 class='lucide lucide-alert-triangle'>
			<path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' />
			<line x1='12' x2='12' y1='9' y2='13' />
			<line x1='12' x2='12.01' y1='17' y2='17' />
		</svg>
	{:else}
		<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'
			 stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'
			 class='lucide lucide-info'>
			<circle cx='12' cy='12' r='10' />
			<path d='M12 16v-4' />
			<path d='M12 8h.01' />
		</svg>
	{/if}
</div>

{#if fieldType === "INPUT"}
	<div class='meta-bind-plugin-input-wrapper'>
		<span>{value}</span>
	</div>
{:else if fieldType === "VIEW"}
	<div class='meta-bind-plugin-view-wrapper'>
		<span>{value}</span>
	</div>
{:else}
	<span>{value}</span>
{/if}

{#if open}
	<div class='meta-bind-error-collection-card'>
		<h5>Meta Bind Field</h5>

		<ErrorCollectionComponent errorCollection={errorCollection}
								  declaration={declaration}></ErrorCollectionComponent>
	</div>
{/if}
