<script lang="ts">
	import { ButtonStyleType, OpenButtonAction } from 'packages/core/src/config/ButtonConfig';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let action: OpenButtonAction;
	export let plugin: IPlugin;
</script>

<SettingComponent name="Link" description="The link to open.">
	<input type="text" bind:value={action.link} placeholder="[[Some Note]] or https://www.example.com" />
</SettingComponent>
