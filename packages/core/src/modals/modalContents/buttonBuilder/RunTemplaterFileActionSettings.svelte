<script lang="ts">
	import type { MetaBind } from 'packages/core/src';
	import { ButtonStyleType, type RunTemplaterFileButtonAction } from 'packages/core/src/config/ButtonConfig';

	import Button from 'packages/core/src/utils/components/Button.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		mb,
		action = $bindable(),
	}: {
		mb: MetaBind;
		action: RunTemplaterFileButtonAction;
	} = $props();

	function changeFilePath(): void {
		mb.internal.openMarkdownFileSelectModal((file: string) => {
			action.templateFile = file;
		});
	}
</script>

<SettingComponent
	name="File path: {action.templateFile || 'default'}"
	description="The path to the templater file, relative to the vault root."
>
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => changeFilePath()} tooltip="Select from vault"
		>Change</Button
	>
</SettingComponent>
