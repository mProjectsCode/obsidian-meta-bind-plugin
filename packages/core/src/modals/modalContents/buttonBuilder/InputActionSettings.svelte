<script lang="ts">
	import { ButtonStyleType, InputButtonAction } from 'packages/core/src/config/ButtonConfig';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let action: InputButtonAction;
	export let plugin: IPlugin;
</script>

<SettingComponent name="Text" description="The text to input at the cursor.">
	<input type="text" bind:value={action.str} placeholder="some text" />
</SettingComponent>
