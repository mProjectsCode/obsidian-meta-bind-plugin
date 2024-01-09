<script lang="ts">
	import { ButtonBuilderModal } from './ButtonBuilderModal';
	import {
		ButtonActionType,
		ButtonConfig,
		ButtonStyleType,
		CommandButtonAction,
		TemplaterCreateNoteButtonAction,
	} from '../../config/ButtonConfig';
	import SettingComponent from '../../utils/components/SettingComponent.svelte';
	import { onDestroy } from 'svelte';
	import { ButtonMDRC } from '../../renderChildren/ButtonMDRC';
	import { Command, stringifyYaml, TFile, TFolder } from 'obsidian';
	import { getUUID } from '../../utils/Utils';
	import Button from '../../utils/components/Button.svelte';
	import Icon from '../../utils/components/Icon.svelte';
	import { CommandSelectModal } from '../../utils/modals/CommandSelectModal';
	import ModalButtonGroup from '../../utils/components/ModalButtonGroup.svelte';
	import { FolderSelectModal } from '../../utils/modals/FolderSelectModal';
	import { FileSelectModal } from '../../utils/modals/FileSelectModal';
	import Toggle from '../../utils/components/Toggle.svelte';

	export let modal: ButtonBuilderModal;
	let buttonConfig: ButtonConfig = {
		label: 'This is a button',
		hidden: false,
		class: '',
		tooltip: '',
		id: '',
		style: ButtonStyleType.DEFAULT,
		actions: [],
	};
	let buttonEl: HTMLElement;
	let buttonMDRC: ButtonMDRC;
	let addActionType: ButtonActionType;

	$: updatePreviewButton(buttonConfig, buttonEl);

	onDestroy(() => {
		buttonMDRC?.unload();
	});

	function updatePreviewButton(config: ButtonConfig, el: HTMLElement) {
		buttonMDRC?.unload();
		if (el) {
			el.empty();
			buttonMDRC = new ButtonMDRC(el, stringifyYaml(config), modal.plugin, '', getUUID());
			buttonMDRC.load();
		}
	}

	function addAction() {
		buttonConfig.actions?.push(modal.plugin.api.buttonActionRunner.createDefaultAction(addActionType));

		buttonConfig.actions = buttonConfig.actions;
	}

	function removeAction(id: number) {
		buttonConfig.actions.splice(id, 1);
		buttonConfig.actions = buttonConfig.actions;
	}

	function commandActionChangeCommand(action: CommandButtonAction) {
		new CommandSelectModal(modal.plugin, (command: Command) => {
			action.command = command.id;
			buttonConfig.actions = buttonConfig.actions;
		}).open();
	}

	function templaterCreateNoteActionChangeTemplateFile(action: TemplaterCreateNoteButtonAction) {
		new FileSelectModal(modal.plugin, (file: TFile) => {
			action.templateFile = file.path;
			buttonConfig.actions = buttonConfig.actions;
		}).open();
	}

	function templaterCreateNoteActionChangeFolderPath(action: TemplaterCreateNoteButtonAction) {
		new FolderSelectModal(modal.plugin, (folder: TFolder) => {
			action.folderPath = folder.path;
			buttonConfig.actions = buttonConfig.actions;
		}).open();
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
		}

		return 'CHANGE ME';
	}
</script>

<h2>Meta Bind Button Builder</h2>

<SettingComponent name="Label" description="The label shown on the button.">
	<input type="text" bind:value={buttonConfig.label} />
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

<Button variant="primary" on:click={() => addAction()}>Add Action</Button>

{#each buttonConfig.actions as action, i (i)}
	<h5>{getActionLabel(action.type)}</h5>

	{#if action.type === ButtonActionType.COMMAND}
		<SettingComponent
			name="Command: {action.command || 'none'}"
			description="The command to execute when this action runs."
		>
			<Button variant="primary" on:click={() => commandActionChangeCommand(action)}>Change</Button>
			<Button variant="destructive" on:click={() => removeAction(i)}>
				<Icon iconName="x"></Icon>
			</Button>
		</SettingComponent>
	{/if}

	{#if action.type === ButtonActionType.OPEN}
		<SettingComponent name="Link" description="The link to open.">
			<input type="text" bind:value={action.link} placeholder="[[Some Note]] or https://www.example.com" />
			<Button variant="destructive" on:click={() => removeAction(i)}>
				<Icon iconName="x"></Icon>
			</Button>
		</SettingComponent>
	{/if}

	{#if action.type === ButtonActionType.JS}
		<SettingComponent name="JS File" description="The JavaScript file to run.">
			<input type="text" bind:value={action.file} placeholder="someJsFile.js" />
			<Button variant="destructive" on:click={() => removeAction(i)}>
				<Icon iconName="x"></Icon>
			</Button>
		</SettingComponent>
	{/if}

	{#if action.type === ButtonActionType.INPUT}
		<SettingComponent name="Text" description="The text to input at the cursor.">
			<input type="text" bind:value={action.str} placeholder="some text" />
			<Button variant="destructive" on:click={() => removeAction(i)}>
				<Icon iconName="x"></Icon>
			</Button>
		</SettingComponent>
	{/if}

	{#if action.type === ButtonActionType.SLEEP}
		<SettingComponent name="Sleep Time" description="The time to sleep in milliseconds.">
			<input type="number" bind:value={action.ms} placeholder="100 ms" />
			<Button variant="destructive" on:click={() => removeAction(i)}>
				<Icon iconName="x"></Icon>
			</Button>
		</SettingComponent>
	{/if}

	{#if action.type === ButtonActionType.TEMPLATER_CREATE_NOTE}
		<Button variant="destructive" on:click={() => removeAction(i)}>Remove Action</Button>

		<SettingComponent
			name="Template File: {action.templateFile || 'none'}"
			description="The template file to create a new note of."
		>
			<Button variant="primary" on:click={() => templaterCreateNoteActionChangeTemplateFile(action)}
				>Change
			</Button>
		</SettingComponent>

		<SettingComponent
			name="Folder: {action.folderPath || 'none'}"
			description="The folder to create a new note in."
		>
			<Button variant="primary" on:click={() => templaterCreateNoteActionChangeFolderPath(action)}>Change</Button>
		</SettingComponent>

		<SettingComponent name="File Name: {action.fileName || 'default'}" description="The file name of the new note.">
			<input type="text" bind:value={action.fileName} placeholder="some name" />
		</SettingComponent>

		<SettingComponent name="Open Note" description="Whether to open the new note after this action ran.">
			<Toggle bind:checked={action.openNote}></Toggle>
		</SettingComponent>
	{/if}

	{#if action.type === ButtonActionType.UPDATE_METADATA}
		<Button variant="destructive" on:click={() => removeAction(i)}>Remove Action</Button>

		<SettingComponent name="Metadata Property" description="The metadata property in form of a bind target.">
			<input type="text" bind:value={action.bindTarget} placeholder="some value" />
		</SettingComponent>

		<SettingComponent name="Value" description="The new value.">
			<input type="text" bind:value={action.value} placeholder="some value" />
		</SettingComponent>

		<SettingComponent name="Evaluate" description="Whether to evaluate the value as a JS expression.">
			<Toggle bind:checked={action.evaluate}></Toggle>
		</SettingComponent>
	{/if}
{/each}

<h4>Preview</h4>

<div bind:this={buttonEl}></div>

<ModalButtonGroup>
	<Button variant="primary" on:click={() => modal.okay(buttonConfig)}>{modal.submitText}</Button>
	<Button variant="default" on:click={() => modal.cancel()}>Cancel</Button>
</ModalButtonGroup>
