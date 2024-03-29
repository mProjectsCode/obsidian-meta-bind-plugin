<script lang="ts">
	import { ButtonStyleType, JSButtonAction } from 'packages/core/src/config/ButtonConfig';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let action: JSButtonAction;
	export let plugin: IPlugin;
</script>

<SettingComponent name="JS File" description="The JavaScript file to run.">
	<input type="text" bind:value={action.file} placeholder="someJsFile.js" />
</SettingComponent>
