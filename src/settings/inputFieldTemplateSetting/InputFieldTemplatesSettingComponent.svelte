<script lang="ts">
	import { InputFieldTemplate } from '../Settings';
	import { Button, ModalButtonGroup } from 'obsidian-svelte';
	import InputFieldTemplateSettingComponent from './InputFieldTemplateSettingComponent.svelte';
	import { InputFieldTemplatesSettingModal } from './InputFieldTemplatesSettingModal';
	import { ErrorCollection } from '../../utils/errors/ErrorCollection';
	import ErrorCollectionComponent from '../../utils/errors/ErrorCollectionComponent.svelte';

	export let inputFieldTemplates: InputFieldTemplate[];
	export let modal: InputFieldTemplatesSettingModal;

	let errorCollection: ErrorCollection | undefined;

	function deleteTemplate(name: string): void {
		inputFieldTemplates = inputFieldTemplates.filter(x => x.name !== name);
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
	<table>
		<thead>
			<tr>
				<th> Template Name</th>
				<th> Template Declaration</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each inputFieldTemplates as template}
				<InputFieldTemplateSettingComponent
					template={template}
					on:delete-template={evt => deleteTemplate(evt.detail.name)}
				></InputFieldTemplateSettingComponent>
			{/each}
		</tbody>
	</table>

	<Button on:click={() => addTemplate()} variant="primary" tooltip="Create New Template">Add Template</Button>

	{#if errorCollection}
		<div>
			<h3 class="mod-error">Some Templates Failed to Parse</h3>

			<ErrorCollectionComponent errorCollection={errorCollection} declaration={undefined}
			></ErrorCollectionComponent>
		</div>
	{/if}

	<ModalButtonGroup>
		<Button on:click={() => save()} variant="primary" tooltip="Save Changes">Save</Button>
		<Button on:click={() => cancel()} tooltip="Revert Changes">Cancel</Button>
	</ModalButtonGroup>
</div>
