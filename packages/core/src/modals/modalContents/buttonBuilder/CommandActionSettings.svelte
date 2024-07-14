<script lang="ts">
	import {
		type ButtonAction,
		ButtonActionType,
		ButtonStyleType,
		type CommandButtonAction,
	} from 'packages/core/src/config/ButtonConfig';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import type { Command } from 'packages/core/src/api/InternalAPI';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: CommandButtonAction;
	} = $props();

	function commandActionChangeCommand(action: ButtonAction) {
		if (action.type !== ButtonActionType.COMMAND) {
			return;
		}

		plugin.internal.openCommandSelectModal((command: Command) => {
			action.command = command.id;
		});
	}
</script>

<SettingComponent
	name="Command: {action.command || 'none'}"
	description="The command to execute when this action runs."
>
	<Button variant={ButtonStyleType.PRIMARY} on:click={() => commandActionChangeCommand(action)}>Change</Button>
</SettingComponent>
