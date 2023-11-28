<script lang="ts">
	import { ButtonBuilderModal } from './ButtonBuilderModal';
	import {
		ButtonActionType,
		ButtonConfig,
		ButtonStyleType,
		CommandButtonAction,
		JSButtonAction,
		OpenButtonAction,
	} from '../../config/ButtonConfig';
	import SettingComponent from '../../utils/components/SettingComponent.svelte';
	import { onDestroy } from 'svelte';
	import { ButtonMDRC } from '../../renderChildren/ButtonMDRC';
	import { Command, stringifyYaml } from 'obsidian';
	import { getUUID } from '../../utils/Utils';
	import Button from '../../utils/components/Button.svelte';
	import Icon from '../../utils/components/Icon.svelte';
	import { CommandSelectModal } from './CommandSelectModal';
	import ModalButtonGroup from '../../utils/components/ModalButtonGroup.svelte';

	export let modal: ButtonBuilderModal;
	let buttonConfig: ButtonConfig = {
		label: 'This is a button',
		hidden: false,
		id: '',
		style: ButtonStyleType.DEFAULT,
		actions: [],
	};
	let buttonEl: HTMLElement;
	let buttonMDRC: ButtonMDRC;
	let addActionType: ButtonActionType;

	$: updateButton(buttonConfig, buttonEl);

	onDestroy(() => {
		buttonMDRC?.unload();
	});

	function updateButton(config: ButtonConfig, el: HTMLElement) {
		buttonMDRC?.unload();
		if (el) {
			buttonMDRC = new ButtonMDRC(el, stringifyYaml(config), modal.plugin, '', getUUID());
			buttonMDRC.load();
		}
	}

	function addAction() {
		if (addActionType === ButtonActionType.COMMAND) {
			buttonConfig.actions.push({ type: ButtonActionType.COMMAND, command: '' } satisfies CommandButtonAction);
		} else if (addActionType === ButtonActionType.OPEN) {
			buttonConfig.actions.push({ type: ButtonActionType.OPEN, link: '' } satisfies OpenButtonAction);
		} else if (addActionType === ButtonActionType.JS) {
			buttonConfig.actions.push({ type: ButtonActionType.JS, jsFile: '' } satisfies JSButtonAction);
		}

		buttonConfig.actions = buttonConfig.actions;
	}

	function removeAction(id: number) {
		buttonConfig.actions.splice(id, 1);
		buttonConfig.actions = buttonConfig.actions;
	}

	function changeCommand(action: CommandButtonAction) {
		new CommandSelectModal(modal.plugin, (command: Command) => {
			action.command = command.id;
			buttonConfig.actions = buttonConfig.actions;
		}).open();
	}

	function getActionHeader(actionType: ButtonActionType): string {
		if (actionType === ButtonActionType.COMMAND) {
			return 'Run a Command';
		} else if (actionType === ButtonActionType.OPEN) {
			return 'Open a Link';
		} else if (actionType === ButtonActionType.JS) {
			return 'Run a JavaScript File';
		}
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

<SettingComponent name="ID" description="An ID that allows the button to be referenced in inline buttons.">
	<input type="text" bind:value={buttonConfig.id} />
</SettingComponent>

<SettingComponent
	name="Hidden"
	description="Whether to not render this button. This can be useful when using inline buttons."
>
	<div
		class="checkbox-container"
		class:is-enabled={buttonConfig.hidden}
		role="switch"
		tabindex="0"
		aria-checked={buttonConfig.hidden}
		on:click={() => (buttonConfig.hidden = !buttonConfig.hidden)}
	>
		<input type="checkbox" tabindex="-1" checked={buttonConfig.hidden} />
	</div>
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
	<h5>{getActionHeader(action.type)}</h5>

	{#if action.type === ButtonActionType.COMMAND}
		<SettingComponent
			name="Command: {action.command || 'none'}"
			description="The command to execute when the button is clicked."
		>
			<Button variant="primary" on:click={() => changeCommand(action)}>Change</Button>
			<Button variant="destructive" on:click={() => removeAction(i)}>
				<Icon iconName="x"></Icon>
			</Button>
		</SettingComponent>
	{/if}

	{#if action.type === ButtonActionType.OPEN}
		<SettingComponent name="Link" description="The link to open when the button is clicked.">
			<input type="text" bind:value={action.link} placeholder="[[Some Note]] or https://www.example.com" />
			<Button variant="destructive" on:click={() => removeAction(i)}>
				<Icon iconName="x"></Icon>
			</Button>
		</SettingComponent>
	{/if}

	{#if action.type === ButtonActionType.JS}
		<SettingComponent name="JS File" description="The JavaScript file to run when this button is clicked.">
			<input type="text" bind:value={action.js} placeholder="someJsFile.js" />
			<Button variant="destructive" on:click={() => removeAction(i)}>
				<Icon iconName="x"></Icon>
			</Button>
		</SettingComponent>
	{/if}
{/each}

<h4>Preview</h4>

<div bind:this={buttonEl}></div>

<ModalButtonGroup>
	<Button variant="primary" on:click={() => modal.okay(buttonConfig)}>Ok</Button>
	<Button variant="destructive" on:click={() => modal.cancel()}>Cancel</Button>
</ModalButtonGroup>
