<script lang="ts">
	import { Notice, parseYaml } from 'obsidian';
	import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import { V_ButtonConfig } from 'packages/core/src/config/ButtonConfigValidators';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import ModalButtonGroup from 'packages/core/src/utils/components/ModalButtonGroup.svelte';
	import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
	import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
	import ErrorCollectionComponent from 'packages/core/src/utils/errors/ErrorCollectionComponent.svelte';
	import { ErrorLevel, MetaBindButtonError } from 'packages/core/src/utils/errors/MetaBindErrors';
	import ButtonTemplateSettingComponent from 'packages/obsidian/src/settings/buttonTemplateSetting/ButtonTemplateSettingComponent.svelte';
	import type { ButtonTemplatesSettingModal } from 'packages/obsidian/src/settings/buttonTemplateSetting/ButtonTemplatesSettingModal';
	import { fromZodError } from 'zod-validation-error';

	let {
		modal,
		buttonConfigs,
	}: {
		modal: ButtonTemplatesSettingModal;
		buttonConfigs: ButtonConfig[];
	} = $props();

	let errorCollection: ErrorCollection | undefined = $state();

	function deleteTemplate(template: ButtonConfig): void {
		buttonConfigs = buttonConfigs.filter(x => x !== template);
	}

	function addTemplate(): void {
		buttonConfigs.push(modal.plugin.api.buttonActionRunner.createDefaultButtonConfig());
	}

	async function addTemplateFromClipboard(): Promise<void> {
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

		buttonConfigs.push(unvalidatedConfig!);

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

	{#each buttonConfigs as _, i}
		<ButtonTemplateSettingComponent plugin={modal.plugin} bind:template={buttonConfigs[i]} onDelete={deleteTemplate}
		></ButtonTemplateSettingComponent>
	{/each}

	<Button onclick={() => addTemplate()} variant={ButtonStyleType.PRIMARY} tooltip="Create New Template"
		>Add Template</Button
	>
	<Button
		onclick={() => addTemplateFromClipboard()}
		variant={ButtonStyleType.DEFAULT}
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
		<Button onclick={() => save()} variant={ButtonStyleType.PRIMARY} tooltip="Save Changes">Save</Button>
		<Button onclick={() => cancel()} tooltip="Revert Changes">Cancel</Button>
	</ModalButtonGroup>
</div>
