<script lang="ts">
	import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
	import ErrorCollectionComponent from 'packages/core/src/utils/errors/ErrorCollectionComponent.svelte';
	import ModalButtonGroup from 'packages/core/src/utils/components/ModalButtonGroup.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
	import { ButtonTemplatesSettingModal } from './ButtonTemplatesSettingModal';
	import ButtonTemplateSettingComponent from './ButtonTemplateSettingComponent.svelte';
	import { V_ButtonConfig } from 'packages/core/src/config/ButtonConfigValidators';
	import { fromZodError } from 'zod-validation-error';
	import { ErrorLevel, MetaBindButtonError } from 'packages/core/src/utils/errors/MetaBindErrors';
	import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
	import { Notice, parseYaml } from 'obsidian';

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

	async function addTemplateFromClipboard(): void {
		let unvalidatedConfig: ButtonConfig | undefined;
		try {
			unvalidatedConfig = parseYaml(await navigator.clipboard.readText());
		} catch (e) {
			console.warn(e);
			new Notice(
				'meta-bind | Can not parse button config. Check your button syntax. See the console for more details.',
			);
			return;
		}

		const validationResult = V_ButtonConfig.safeParse(unvalidatedConfig);

		if (!validationResult.success) {
			const niceError = fromZodError(validationResult.error, {
				unionSeparator: '\nOR ',
				issueSeparator: ' AND ',
				prefix: null,
			});

			console.warn(
				new MetaBindButtonError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'can not parse button config',
					cause: 'zod validation failed. Check your button syntax',
					positionContext: niceError.message,
					docs: [DocsUtils.linkToButtonConfig()],
				}),
			);
			console.warn(niceError);

			new Notice(
				'meta-bind | Can not parse button config. Check your button syntax. See the console for more details.',
			);
			return;
		}

		buttonConfigs.push(unvalidatedConfig as ButtonConfig);

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
	<h2>Meta Bind Button Templates</h2>

	{#each buttonConfigs as template}
		<ButtonTemplateSettingComponent
			plugin={modal.plugin}
			template={template}
			on:delete-template={evt => deleteTemplate(evt.detail.template)}
		></ButtonTemplateSettingComponent>
	{/each}

	<Button on:click={() => addTemplate()} variant="primary" tooltip="Create New Template">Add Template</Button>
	<Button
		on:click={() => addTemplateFromClipboard()}
		variant="default"
		tooltip="Create New Template from YAML in Clipboard"
		>Add Template from Clipboard
	</Button>

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
