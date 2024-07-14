<script lang="ts">
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { InputFieldTemplate } from 'packages/core/src/Settings';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import ModalButtonGroup from 'packages/core/src/utils/components/ModalButtonGroup.svelte';
	import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
	import ErrorCollectionComponent from 'packages/core/src/utils/errors/ErrorCollectionComponent.svelte';
	import InputFieldTemplateSettingComponent from 'packages/obsidian/src/settings/inputFieldTemplateSetting/InputFieldTemplateSettingComponent.svelte';
	import type { InputFieldTemplatesSettingModal } from 'packages/obsidian/src/settings/inputFieldTemplateSetting/InputFieldTemplatesSettingModal';

	let {
		modal,
		inputFieldTemplates,
	}: {
		modal: InputFieldTemplatesSettingModal;
		inputFieldTemplates: InputFieldTemplate[];
	} = $props();

	let errorCollection: ErrorCollection | undefined = $state();

	function deleteTemplate(template: InputFieldTemplate): void {
		inputFieldTemplates = inputFieldTemplates.filter(x => x !== template);
	}

	function addTemplate(): void {
		inputFieldTemplates.push({
			name: '',
			declaration: '',
		});
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
		<InputFieldTemplateSettingComponent plugin={modal.plugin} template={template} onDelete={deleteTemplate}
		></InputFieldTemplateSettingComponent>
	{/each}

	<Button on:click={() => addTemplate()} variant={ButtonStyleType.PRIMARY} tooltip="Create New Template"
		>Add Template</Button
	>

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
		<Button on:click={() => save()} variant={ButtonStyleType.PRIMARY} tooltip="Save Changes">Save</Button>
		<Button on:click={() => cancel()} tooltip="Revert Changes">Cancel</Button>
	</ModalButtonGroup>
</div>
