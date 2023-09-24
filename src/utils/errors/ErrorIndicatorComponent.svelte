<script lang="ts">

	import {ErrorCollection} from './ErrorCollection';
	import {ErrorCollectionViewModal} from './ErrorCollectionViewModal';
	import {App} from 'obsidian';

	export let app: App;
	export let errorCollection: ErrorCollection;
	export let declaration: string;

	function openModal() {
		const modal = new ErrorCollectionViewModal(app, errorCollection, declaration);
		modal.open();
	}
</script>

{#if !errorCollection.isEmpty()}
	<div class="meta-bind-error-collection" on:click={() => openModal()}
		 on:keydown={(e) => { if (e.key === ' ') { openModal() } }} role="button" tabindex=0>
		{#if errorCollection.hasErrors()}
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
				 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
				 class="lucide lucide-alert-circle">
				<circle cx="12" cy="12" r="10"/>
				<line x1="12" x2="12" y1="8" y2="12"/>
				<line x1="12" x2="12.01" y1="16" y2="16"/>
			</svg>
			<span class="meta-bind-plugin-error">[META_BIND_ERROR]</span>
		{:else if errorCollection.hasWarnings()}
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
				 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
				 class="lucide lucide-alert-triangle">
				<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
				<line x1="12" x2="12" y1="9" y2="13"/>
				<line x1="12" x2="12.01" y1="17" y2="17"/>
			</svg>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
				 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
				 class="lucide lucide-info">
				<circle cx="12" cy="12" r="10"/>
				<path d="M12 16v-4"/>
				<path d="M12 8h.01"/>
			</svg>
		{/if}
	</div>
{/if}
