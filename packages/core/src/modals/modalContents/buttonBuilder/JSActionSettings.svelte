<script lang="ts">
	import type { MetaBind } from 'packages/core/src';
	import { ButtonStyleType, type JSButtonAction } from 'packages/core/src/config/ButtonConfig';

	import Button from 'packages/core/src/utils/components/Button.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		mb,
		action = $bindable(),
	}: {
		mb: MetaBind;
		action: JSButtonAction;
	} = $props();

	function changeFilePath(): void {
		mb.internal.openFilteredFileSelectModal(
			(file: string) => {
				action.file = file;
			},
			(file: string) => file.endsWith('.js'),
		);
	}
</script>

<SettingComponent name="JS file" description="The JavaScript file to run.">
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => changeFilePath()} tooltip="Select from vault"
		>Change</Button
	>
</SettingComponent>
