<script lang="ts">
	import {
		ButtonAction,
		ButtonActionType,
		ButtonStyleType,
		CommandButtonAction,
	} from 'packages/core/src/config/ButtonConfig';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';
	import { Command } from 'packages/core/src/api/InternalAPI';

	export let action: CommandButtonAction;
	export let plugin: IPlugin;
	export let updateActions: () => void;

	function commandActionChangeCommand(action: ButtonAction) {
		if (action.type !== ButtonActionType.COMMAND) {
			return;
		}

		plugin.internal.openCommandSelectModal((command: Command) => {
			action.command = command.id;
			updateActions();
		});
	}
</script>

<SettingComponent
	name="Command: {action.command || 'none'}"
	description="The command to execute when this action runs."
>
	<Button variant={ButtonStyleType.PRIMARY} on:click={() => commandActionChangeCommand(action)}>Change</Button>
</SettingComponent>
