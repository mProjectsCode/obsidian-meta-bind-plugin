<script lang="ts">
	import { ButtonBuilderModal } from 'packages/core/src/modals/modalContents/buttonBuilder/ButtonBuilderModal';
	import { ButtonActionType, ButtonConfig, ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import { onDestroy } from 'svelte';
	import { DomHelpers } from 'packages/core/src/utils/Utils';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import ModalButtonGroup from 'packages/core/src/utils/components/ModalButtonGroup.svelte';
	import Toggle from 'packages/core/src/utils/components/Toggle.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';
	import { ButtonField } from 'packages/core/src/fields/button/ButtonField';
	import CommandActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/CommandActionSettings.svelte';
	import JSActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/JSActionSettings.svelte';
	import OpenActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/OpenActionSettings.svelte';
	import InputActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/InputActionSettings.svelte';
	import SleepActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/SleepActionSettings.svelte';
	import TemplaterCreateNoteActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/TemplaterCreateNoteActionSettings.svelte';
	import UpdateMetadataActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/UpdateMetadataActionSettings.svelte';
	import CreateNoteActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/CreateNoteActionSettings.svelte';
	import ReplaceInNoteActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/ReplaceInNoteActionSettings.svelte';
	import RegexpReplaceInNoteActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/RegexpReplaceInNoteActionSettings.svelte';
	import ReplaceSelfActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/ReplaceSelfActionSettings.svelte';
	import InsertIntoNoteActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/InsertIntoNoteActionSettings.svelte';
	import InlineJsActionSettings from 'packages/core/src/modals/modalContents/buttonBuilder/InlineJsActionSettings.svelte';
	import FlexRow from 'packages/core/src/utils/components/FlexRow.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';
	import { RenderChildType } from 'packages/core/src/config/APIConfigs';

	export let plugin: IPlugin;
	export let modal: ButtonBuilderModal;
	export let buttonConfig: ButtonConfig;

	let buttonEl: HTMLElement;
	let buttonMountable: ButtonField;
	let addActionType: ButtonActionType;

	$: updatePreviewButton(buttonConfig, buttonEl);

	onDestroy(() => {
		buttonMountable?.unmount();
	});

	function updatePreviewButton(config: ButtonConfig, el: HTMLElement) {
		buttonMountable?.unmount();
		if (el) {
			DomHelpers.empty(el);
			buttonMountable = new ButtonField(plugin, config, '', RenderChildType.BLOCK, undefined, false, true);
			buttonMountable.mount(el);
		}
	}

	function addAction() {
		buttonConfig.actions?.push(plugin.api.buttonActionRunner.createDefaultAction(addActionType));

		buttonConfig.actions = buttonConfig.actions;
	}

	function removeAction(id: number) {
		buttonConfig.actions?.splice(id, 1);
		buttonConfig.actions = buttonConfig.actions;
	}

	function updateActions() {
		buttonConfig.actions = buttonConfig.actions;
	}

	function getActionLabel(actionType: ButtonActionType): string {
		if (actionType === ButtonActionType.COMMAND) {
			return 'Run a Command';
		} else if (actionType === ButtonActionType.OPEN) {
			return 'Open a Link';
		} else if (actionType === ButtonActionType.JS) {
			return 'Run a JavaScript File';
		} else if (actionType === ButtonActionType.INPUT) {
			return 'Insert Text at Cursor';
		} else if (actionType === ButtonActionType.SLEEP) {
			return 'Sleep for Some Time';
		} else if (actionType === ButtonActionType.TEMPLATER_CREATE_NOTE) {
			return 'Create a New Note Using Templater';
		} else if (actionType === ButtonActionType.UPDATE_METADATA) {
			return 'Update Metadata';
		} else if (actionType === ButtonActionType.CREATE_NOTE) {
			return 'Create a New Note';
		} else if (actionType === ButtonActionType.REPLACE_IN_NOTE) {
			return 'Replace Text in Note';
		} else if (actionType === ButtonActionType.REGEXP_REPLACE_IN_NOTE) {
			return 'Replace Text in Note using Regexp';
		} else if (actionType === ButtonActionType.REPLACE_SELF) {
			return 'Replace Button with Text';
		} else if (actionType === ButtonActionType.INSERT_INTO_NOTE) {
			return 'Insert Text into the Note';
		} else if (actionType === ButtonActionType.INLINE_JS) {
			return 'Run JavaScript Code';
		}

		return 'CHANGE ME';
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
	name="CSS Classes"
	description="A list of CSS classes to add to the button. Multiple classes should be separated by a space."
>
	<input type="text" bind:value={buttonConfig.class} />
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

<Button variant={ButtonStyleType.PRIMARY} on:click={() => addAction()}>Add Action</Button>

{#each buttonConfig.actions ?? [] as action, i (i)}
	<FlexRow>
		<h5>{getActionLabel(action.type)}</h5>
		<Button variant={ButtonStyleType.PLAIN} on:click={e => openActionContextMenu(i, e)}>
			<Icon iconName="more-vertical" plugin={plugin}></Icon>
		</Button>
	</FlexRow>

	{#if action.type === ButtonActionType.COMMAND}
		<CommandActionSettings action={action} plugin={plugin} updateActions={() => updateActions()}
		></CommandActionSettings>
	{/if}

	{#if action.type === ButtonActionType.OPEN}
		<OpenActionSettings action={action} plugin={plugin}></OpenActionSettings>
	{/if}

	{#if action.type === ButtonActionType.JS}
		<JSActionSettings action={action} plugin={plugin}></JSActionSettings>
	{/if}

	{#if action.type === ButtonActionType.INPUT}
		<InputActionSettings action={action} plugin={plugin}></InputActionSettings>
	{/if}

	{#if action.type === ButtonActionType.SLEEP}
		<SleepActionSettings action={action} plugin={plugin}></SleepActionSettings>
	{/if}

	{#if action.type === ButtonActionType.TEMPLATER_CREATE_NOTE}
		<TemplaterCreateNoteActionSettings action={action} plugin={plugin} updateActions={() => updateActions()}
		></TemplaterCreateNoteActionSettings>
	{/if}

	{#if action.type === ButtonActionType.UPDATE_METADATA}
		<UpdateMetadataActionSettings action={action} plugin={plugin}></UpdateMetadataActionSettings>
	{/if}

	{#if action.type === ButtonActionType.CREATE_NOTE}
		<CreateNoteActionSettings action={action} plugin={plugin} updateActions={() => updateActions()}
		></CreateNoteActionSettings>
	{/if}

	{#if action.type === ButtonActionType.REPLACE_IN_NOTE}
		<ReplaceInNoteActionSettings action={action} plugin={plugin}></ReplaceInNoteActionSettings>
	{/if}

	{#if action.type === ButtonActionType.REGEXP_REPLACE_IN_NOTE}
		<RegexpReplaceInNoteActionSettings action={action} plugin={plugin}></RegexpReplaceInNoteActionSettings>
	{/if}

	{#if action.type === ButtonActionType.REPLACE_SELF}
		<ReplaceSelfActionSettings action={action} plugin={plugin}></ReplaceSelfActionSettings>
	{/if}

	{#if action.type === ButtonActionType.INSERT_INTO_NOTE}
		<InsertIntoNoteActionSettings action={action} plugin={plugin}></InsertIntoNoteActionSettings>
	{/if}

	{#if action.type === ButtonActionType.INLINE_JS}
		<InlineJsActionSettings action={action} plugin={plugin}></InlineJsActionSettings>
	{/if}
{/each}

<h4>Preview</h4>

<div bind:this={buttonEl}></div>

<ModalButtonGroup>
	<Button variant={ButtonStyleType.PRIMARY} on:click={() => modal.okay(buttonConfig)}
		>{modal.options.submitText}</Button
	>
	<Button variant={ButtonStyleType.DEFAULT} on:click={() => modal.cancel()}>Cancel</Button>
</ModalButtonGroup>
