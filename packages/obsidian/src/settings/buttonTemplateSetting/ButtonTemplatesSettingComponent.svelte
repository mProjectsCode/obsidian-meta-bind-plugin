<script lang="ts">
	import { Notice, parseYaml } from 'obsidian';
	import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import { V_ButtonConfig } from 'packages/core/src/config/validators/ButtonConfigValidators';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import ModalButtonGroup from 'packages/core/src/utils/components/ModalButtonGroup.svelte';
	import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
	import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
	import ErrorCollectionComponent from 'packages/core/src/utils/errors/ErrorCollectionComponent.svelte';
	import { ErrorLevel, MetaBindButtonError } from 'packages/core/src/utils/errors/MetaBindErrors';
	import { toReadableError } from 'packages/core/src/utils/ZodUtils';
	import ButtonTemplateSettingComponent from 'packages/obsidian/src/settings/buttonTemplateSetting/ButtonTemplateSettingComponent.svelte';
	import type { ButtonTemplatesSettingModal } from 'packages/obsidian/src/settings/buttonTemplateSetting/ButtonTemplatesSettingModal';

	let {
		modal,
		buttonConfigs: propButtonConfigs,
	}: {
		modal: ButtonTemplatesSettingModal;
		buttonConfigs: ButtonConfig[];
	} = $props();

	let errorCollection: ErrorCollection | undefined = $state();
	let buttonConfigs: ButtonConfig[] = $state(propButtonConfigs);

	function deleteTemplate(template: ButtonConfig): void {
		buttonConfigs = buttonConfigs.filter(x => x !== template);
	}

	function addTemplate(): void {
		buttonConfigs.push(modal.mb.buttonActionRunner.createDefaultButtonConfig());
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
			const niceError = toReadableError(validationResult.error);

			console.warn(
				new MetaBindButtonError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'can not parse button config',
					cause: 'zod validation failed. Check your button syntax',
					positionContext: niceError,
					docs: [DocsUtils.linkToButtonConfig()],
				}),
			);

			new Notice(
				'meta-bind | Can not parse button config. Check your button syntax. See the console for more details.',
			);
			return;
		}

		buttonConfigs.push(unvalidatedConfig!);
	}

	function save(): void {
		errorCollection = modal.save($state.snapshot(buttonConfigs));

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
		<ButtonTemplateSettingComponent mb={modal.mb} bind:template={buttonConfigs[i]} onDelete={deleteTemplate}
		></ButtonTemplateSettingComponent>
	{/each}

	<Button onclick={() => addTemplate()} variant={ButtonStyleType.PRIMARY} tooltip="Create new template"
		>Add Template</Button
	>
	<Button
		onclick={() => addTemplateFromClipboard()}
		variant={ButtonStyleType.DEFAULT}
		tooltip="Create new template from YAML in clipboard"
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
		<Button onclick={() => save()} variant={ButtonStyleType.PRIMARY} tooltip="Save changes">Save</Button>
		<Button onclick={() => cancel()} tooltip="Revert changes">Cancel</Button>
	</ModalButtonGroup>
</div>
