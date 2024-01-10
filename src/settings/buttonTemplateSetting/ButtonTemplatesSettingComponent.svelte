<script lang="ts">
	import { ErrorCollection } from '../../utils/errors/ErrorCollection';
	import ErrorCollectionComponent from '../../utils/errors/ErrorCollectionComponent.svelte';
	import ModalButtonGroup from '../../utils/components/ModalButtonGroup.svelte';
	import Button from '../../utils/components/Button.svelte';
	import { ButtonConfig } from '../../config/ButtonConfig';
	import { ButtonTemplatesSettingModal } from './ButtonTemplatesSettingModal';
	import ButtonTemplateSettingComponent from './ButtonTemplateSettingComponent.svelte';

	export let buttonConfigs: ButtonConfig[];
	export let modal: ButtonTemplatesSettingModal;

	let errorCollection: ErrorCollection | undefined;

	function deleteTemplate(template: ButtonConfig): void {
		buttonConfigs = buttonConfigs.filter(x => x !== template);
	}

	function addTemplate(): void {
		buttonConfigs.push(modal.plugin.api.buttonActionRunner.createDefaultButtonConfig());

		buttonConfigs = buttonConfigs;
	}

	function save(): void {
		errorCollection = modal.save(buttonConfigs);

		if (errorCollection === undefined) {
			modal.close();
		}
	}

	function cancel(): void {
		modal.close();
	}
</script>

<div>
	{#each buttonConfigs as template}
		<ButtonTemplateSettingComponent
			plugin={modal.plugin}
			template={template}
			on:delete-template={evt => deleteTemplate(evt.detail.template)}
		></ButtonTemplateSettingComponent>
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
