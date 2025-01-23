<script lang="ts">
	import { RenderChildType } from 'packages/core/src/config/APIConfigs';
	import type {
		ButtonConfig,
		CommandButtonAction,
		CreateNoteButtonAction,
		InlineJSButtonAction,
		InputButtonAction,
		InsertIntoNoteButtonAction,
		JSButtonAction,
		OpenButtonAction,
		RegexpReplaceInNoteButtonAction,
		ReplaceInNoteButtonAction,
		ReplaceSelfButtonAction,
		RunTemplaterFileButtonAction,
		SleepButtonAction,
		TemplaterCreateNoteButtonAction,
		UpdateMetadataButtonAction,
	} from 'packages/core/src/config/ButtonConfig';
	import { ButtonActionType, ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import { ButtonField } from 'packages/core/src/fields/button/ButtonField';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import type { ButtonBuilderModal } from 'packages/core/src/modals/modalContents/buttonBuilder/ButtonBuilderModal';
	import CommandActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/CommandActionSettings.svelte';
	import CreateNoteActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/CreateNoteActionSettings.svelte';
	import RunTemplaterFileActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/RunTemplaterFileActionSettings.svelte';
	import InlineJsActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/InlineJsActionSettings.svelte';
	import InputActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/InputActionSettings.svelte';
	import InsertIntoNoteActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/InsertIntoNoteActionSettings.svelte';
	import JSActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/JSActionSettings.svelte';
	import OpenActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/OpenActionSettings.svelte';
	import RegexpReplaceInNoteActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/RegexpReplaceInNoteActionSettings.svelte';
	import ReplaceInNoteActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/ReplaceInNoteActionSettings.svelte';
	import ReplaceSelfActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/ReplaceSelfActionSettings.svelte';
	import SleepActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/SleepActionSettings.svelte';
	import TemplaterCreateNoteActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/TemplaterCreateNoteActionSettings.svelte';
	import UpdateMetadataActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/UpdateMetadataActionSettings.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import FlexRow from 'packages/core/src/utils/components/FlexRow.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import ModalButtonGroup from 'packages/core/src/utils/components/ModalButtonGroup.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import Toggle from 'packages/core/src/utils/components/Toggle.svelte';
	import type { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';
	import { DomHelpers } from 'packages/core/src/utils/Utils';
	import { onDestroy } from 'svelte';

	let {
		plugin,
		modal,
		buttonConfig: propConfig = $bindable(),
	}: {
		plugin: IPlugin;
		modal: ButtonBuilderModal;
		buttonConfig: ButtonConfig;
	} = $props();

	let buttonConfig = $state(propConfig);

	let buttonEl: HTMLElement;
	let buttonMountable: ButtonField;
	let addActionType: ButtonActionType = $state(ButtonActionType.COMMAND);

	onDestroy(() => {
		buttonMountable?.unmount();
	});

	$effect(() => {
		buttonMountable?.unmount();
		if (buttonEl) {
			DomHelpers.empty(buttonEl);
			buttonMountable = new ButtonField(
				plugin,
				$state.snapshot(buttonConfig),
				'',
				RenderChildType.BLOCK,
				undefined,
				false,
				true,
			);
			buttonMountable.mount(buttonEl);
		}
	});

	function addAction(): void {
		buttonConfig.actions?.push(plugin.api.buttonActionRunner.createDefaultAction(addActionType));
	}

	function removeAction(id: number): void {
		buttonConfig.actions?.splice(id, 1);
	}

	function getActionLabel(actionType: ButtonActionType): string {
		return plugin.api.buttonActionRunner.getActionLabel(actionType);
	}

	function openActionContextMenu(index: number, e: MouseEvent): void {
		if (buttonConfig.actions === undefined) {
			return;
		}

		const menuActions: ContextMenuItemDefinition[] = [];

		if (index > 0) {
			menuActions.push({
				name: 'Move up',
				icon: 'arrow-up',
				onclick: () => {
					if (buttonConfig.actions === undefined) {
						return;
					}

					const temp = buttonConfig.actions[index - 1];
					buttonConfig.actions[index - 1] = buttonConfig.actions[index];
					buttonConfig.actions[index] = temp;
				},
			});
		}

		if (index < buttonConfig.actions.length - 1) {
			menuActions.push({
				name: 'Move down',
				icon: 'arrow-down',
				onclick: () => {
					if (buttonConfig.actions === undefined) {
						return;
					}

					const temp = buttonConfig.actions[index + 1];
					buttonConfig.actions[index + 1] = buttonConfig.actions[index];
					buttonConfig.actions[index] = temp;
				},
			});
		}

		menuActions.push({
			name: 'Remove',
			icon: 'x',
			warning: true,
			onclick: () => removeAction(index),
		});

		plugin.internal.createContextMenu(menuActions).showWithEvent(e);
	}

	function changeBackgroundImage(): void {
		plugin.internal.openImageFileSelectModal((file: string) => {
			buttonConfig.backgroundImage = file;
		});
	}

	function resetBackgroundImage(): void {
		buttonConfig.backgroundImage = undefined;
	}
</script>

<SettingComponent name="Label" description="The label shown on the button.">
	<input type="text" bind:value={buttonConfig.label} />
</SettingComponent>

<SettingComponent name="Icon" description="The icon shown on the button. If left empty, no icon will show">
	<input type="text" bind:value={buttonConfig.icon} />
</SettingComponent>

<SettingComponent name="Style" description="The style variant of the button">
	<select class="dropdown" bind:value={buttonConfig.style}>
		{#each Object.values(ButtonStyleType) as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</SettingComponent>

<SettingComponent
	name="CSS classes"
	description="A list of CSS classes to add to the button. Multiple classes should be separated by a space."
>
	<input type="text" bind:value={buttonConfig.class} />
</SettingComponent>

<SettingComponent name="CSS styles" description="CSS styles to directly apply to the button.">
	<input type="text" bind:value={buttonConfig.cssStyle} />
</SettingComponent>

<SettingComponent name="Background image" description="A background image to use in the button.">
	<span style="word-break: break-word">{buttonConfig.backgroundImage || 'none'}</span>
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => changeBackgroundImage()} tooltip="Select from vault"
		>Change</Button
	>
	<Button variant={ButtonStyleType.DEFAULT} onclick={() => resetBackgroundImage()} tooltip="Reset to none"
		><Icon plugin={plugin} iconName="x"></Icon></Button
	>
</SettingComponent>

<SettingComponent
	name="Tooltip"
	description="A tooltip to show when hovering the button. If not set, the button label will be shown instead."
>
	<input type="text" bind:value={buttonConfig.tooltip} />
</SettingComponent>

<SettingComponent name="ID" description="An ID that allows the button to be referenced in inline buttons.">
	<input type="text" bind:value={buttonConfig.id} />
</SettingComponent>

<SettingComponent
	name="Hidden"
	description="Whether to not render this button. This can be useful when using inline buttons."
>
	<Toggle bind:checked={buttonConfig.hidden}></Toggle>
</SettingComponent>

<h4>Actions</h4>

Add action of type
<select class="dropdown" bind:value={addActionType}>
	{#each Object.values(ButtonActionType) as option}
		<option value={option}>{option}</option>
	{/each}
</select>

<Button variant={ButtonStyleType.PRIMARY} onclick={() => addAction()}>Add Action</Button>
{#if buttonConfig.actions}
	{#each buttonConfig.actions ?? [] as action, i (i)}
		<FlexRow>
			<h5>{getActionLabel(action.type)}</h5>
			<!-- eslint-disable-next-line @typescript-eslint/no-unsafe-argument -->
			<Button variant={ButtonStyleType.PLAIN} onclick={e => openActionContextMenu(i, e)}>
				<Icon iconName="more-vertical" plugin={plugin}></Icon>
			</Button>
		</FlexRow>

		{#if action.type === ButtonActionType.COMMAND}
			<CommandActionSettings bind:action={buttonConfig.actions[i] as CommandButtonAction} plugin={plugin}
			></CommandActionSettings>
		{/if}

		{#if action.type === ButtonActionType.OPEN}
			<OpenActionSettings bind:action={buttonConfig.actions[i] as OpenButtonAction} plugin={plugin}
			></OpenActionSettings>
		{/if}

		{#if action.type === ButtonActionType.JS}
			<JSActionSettings bind:action={buttonConfig.actions[i] as JSButtonAction} plugin={plugin}
			></JSActionSettings>
		{/if}

		{#if action.type === ButtonActionType.INPUT}
			<InputActionSettings bind:action={buttonConfig.actions[i] as InputButtonAction} plugin={plugin}
			></InputActionSettings>
		{/if}

		{#if action.type === ButtonActionType.SLEEP}
			<SleepActionSettings bind:action={buttonConfig.actions[i] as SleepButtonAction} plugin={plugin}
			></SleepActionSettings>
		{/if}

		{#if action.type === ButtonActionType.TEMPLATER_CREATE_NOTE}
			<TemplaterCreateNoteActionSettings
				bind:action={buttonConfig.actions[i] as TemplaterCreateNoteButtonAction}
				plugin={plugin}
			></TemplaterCreateNoteActionSettings>
		{/if}

		{#if action.type === ButtonActionType.UPDATE_METADATA}
			<UpdateMetadataActionSettings
				bind:action={buttonConfig.actions[i] as UpdateMetadataButtonAction}
				plugin={plugin}
			></UpdateMetadataActionSettings>
		{/if}

		{#if action.type === ButtonActionType.CREATE_NOTE}
			<CreateNoteActionSettings bind:action={buttonConfig.actions[i] as CreateNoteButtonAction} plugin={plugin}
			></CreateNoteActionSettings>
		{/if}

		{#if action.type === ButtonActionType.RUN_TEMPLATER_FILE}
			<RunTemplaterFileActionSettings
				bind:action={buttonConfig.actions[i] as RunTemplaterFileButtonAction}
				plugin={plugin}
			></RunTemplaterFileActionSettings>
		{/if}

		{#if action.type === ButtonActionType.REPLACE_IN_NOTE}
			<ReplaceInNoteActionSettings
				bind:action={buttonConfig.actions[i] as ReplaceInNoteButtonAction}
				plugin={plugin}
			></ReplaceInNoteActionSettings>
		{/if}

		{#if action.type === ButtonActionType.REGEXP_REPLACE_IN_NOTE}
			<RegexpReplaceInNoteActionSettings
				bind:action={buttonConfig.actions[i] as RegexpReplaceInNoteButtonAction}
				plugin={plugin}
			></RegexpReplaceInNoteActionSettings>
		{/if}

		{#if action.type === ButtonActionType.REPLACE_SELF}
			<ReplaceSelfActionSettings bind:action={buttonConfig.actions[i] as ReplaceSelfButtonAction} plugin={plugin}
			></ReplaceSelfActionSettings>
		{/if}

		{#if action.type === ButtonActionType.INSERT_INTO_NOTE}
			<InsertIntoNoteActionSettings
				bind:action={buttonConfig.actions[i] as InsertIntoNoteButtonAction}
				plugin={plugin}
			></InsertIntoNoteActionSettings>
		{/if}

		{#if action.type === ButtonActionType.INLINE_JS}
			<InlineJsActionSettings bind:action={buttonConfig.actions[i] as InlineJSButtonAction} plugin={plugin}
			></InlineJsActionSettings>
		{/if}
	{/each}
{/if}

<h4>Preview</h4>

<div bind:this={buttonEl}></div>

<ModalButtonGroup>
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => modal.okay($state.snapshot(buttonConfig))}
		>{modal.options.submitText}</Button
	>
	<Button variant={ButtonStyleType.DEFAULT} onclick={() => modal.cancel()}>Cancel</Button>
</ModalButtonGroup>
