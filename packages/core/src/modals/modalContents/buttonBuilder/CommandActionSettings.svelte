<script lang="ts">
	import type { Command } from 'packages/core/src/api/InternalAPI';
	import type { ButtonAction, CommandButtonAction } from 'packages/core/src/config/ButtonConfig';
	import { ButtonActionType, ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: CommandButtonAction;
	} = $props();

	function commandActionChangeCommand(action: ButtonAction): void {
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
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => commandActionChangeCommand(action)}>Change</Button>
</SettingComponent>
