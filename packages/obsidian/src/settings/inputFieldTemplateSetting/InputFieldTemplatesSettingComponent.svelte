<script lang="ts">
	import InputFieldTemplateSettingComponent from './InputFieldTemplateSettingComponent.svelte';
	import { InputFieldTemplatesSettingModal } from './InputFieldTemplatesSettingModal';
	import ErrorCollectionComponent from 'packages/core/src/utils/errors/ErrorCollectionComponent.svelte';
	import ModalButtonGroup from 'packages/core/src/utils/components/ModalButtonGroup.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
	import { InputFieldTemplate } from 'packages/core/src/Settings';

	export let inputFieldTemplates: InputFieldTemplate[];
	export let modal: InputFieldTemplatesSettingModal;

	let errorCollection: ErrorCollection | undefined;

	function deleteTemplate(template: InputFieldTemplate): void {
		inputFieldTemplates = inputFieldTemplates.filter(x => x !== template);
	}

	function addTemplate(): void {
		inputFieldTemplates.push({
			name: '',
			declaration: '',
		});

		inputFieldTemplates = inputFieldTemplates;
	}

	function save(): void {
		errorCollection = modal.save(inputFieldTemplates);

		if (errorCollection === undefined) {
			modal.close();
		}
	}

	function cancel(): void {
		modal.close();
	}
</script>

<div>
	<h2>Meta Bind Input Field Templates</h2>

	{#each inputFieldTemplates as template}
		<InputFieldTemplateSettingComponent
			plugin={modal.plugin}
			template={template}
			on:delete-template={evt => deleteTemplate(evt.detail.template)}
		></InputFieldTemplateSettingComponent>
	{/each}

	<Button on:click={() => addTemplate()} variant="primary" tooltip="Create New Template">Add Template</Button>

	{#if errorCollection}
		<div>
			<h3 class="mod-error">Some Templates Failed to Parse</h3>

			<ErrorCollectionComponent
				settings={{
					errorCollection: errorCollection,
				}}
			></ErrorCollectionComponent>
		</div>
	{/if}

	<ModalButtonGroup>
		<Button on:click={() => save()} variant="primary" tooltip="Save Changes">Save</Button>
		<Button on:click={() => cancel()} tooltip="Revert Changes">Cancel</Button>
	</ModalButtonGroup>
</div>
